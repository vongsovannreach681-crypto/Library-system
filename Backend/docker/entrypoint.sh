#!/usr/bin/env bash
set -e

echo "===> Preparing environment for Render..."

# Configure port for Nginx (Render provides PORT, default to 10000 or 80)
PORT="${PORT:-10000}"
echo "===> Setting up Nginx to listen on port ${PORT}"
sed -i "s/listen 80;/listen ${PORT};/g" /etc/nginx/http.d/default.conf
sed -i "s/listen \[::\]:80;/listen \[::\]:${PORT};/g" /etc/nginx/http.d/default.conf

# Ensure .env file exists in the container
if [ ! -f /var/www/html/.env ]; then
    echo "===> Creating .env from .env.example..."
    cp /var/www/html/.env.example /var/www/html/.env
fi

# Ensure SESSION_DRIVER is file (not database) to avoid dependency on database sessions table
sed -i "s|^SESSION_DRIVER=.*|SESSION_DRIVER=file|" /var/www/html/.env 2>/dev/null || true

# Synchronize or generate APP_KEY
if [ -n "$APP_KEY" ]; then
    echo "===> Syncing APP_KEY from environment..."
    sed -i "s|^APP_KEY=.*|APP_KEY=${APP_KEY}|" /var/www/html/.env
else
    if ! grep -q "^APP_KEY=base64:" /var/www/html/.env; then
        echo "===> Generating new APP_KEY..."
        php artisan key:generate --force
    fi
fi

# If using Neon pooled connection, switch to direct connection for migrations
# PgBouncer pooled connections fail on DDL transactions (SQLSTATE 25P02)
if [[ "$DATABASE_URL" == *"-pooler."* ]]; then
    echo "===> Detected Neon pooled connection. Switching to direct host for migrations..."
    DIRECT_URL="${DATABASE_URL//-pooler./.}"
    export DATABASE_URL="$DIRECT_URL"
    export DB_URL="$DIRECT_URL"
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${DIRECT_URL}|" /var/www/html/.env 2>/dev/null || true
fi

# Ensure storage directories and permissions
echo "===> Setting storage permissions..."
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/storage/app/public/posts
mkdir -p /var/www/html/storage/app/public/profiles
mkdir -p /var/www/html/storage/app/public/books
mkdir -p /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# SQLite fallback if no external DB is configured
if [ "$DB_CONNECTION" = "sqlite" ] || ([ -z "$DB_CONNECTION" ] && [ -z "$DATABASE_URL" ] && [ -z "$DB_HOST" ]); then
    echo "===> Ensuring SQLite database file exists..."
    mkdir -p /var/www/html/database
    touch /var/www/html/database/database.sqlite
    chown -R www-data:www-data /var/www/html/database
fi

# Create storage symlink
echo "===> Linking storage..."
php artisan storage:link --force || true

# Run database migrations
echo "===> Running migrations..."
php artisan migrate --force || echo "===> Migration completed or skipped."

# Clear existing cache and re-cache in production
if [ "$APP_ENV" = "production" ]; then
    echo "===> Optimizing configuration for production..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

echo "===> Starting Nginx and PHP-FPM via supervisord on port ${PORT}..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
