#!/usr/bin/env bash
set -e

echo "===> Preparing environment for Render..."

# Configure port for Nginx
PORT="${PORT:-80}"
echo "===> Setting up Nginx to listen on port ${PORT}"
sed -i "s/listen 80;/listen ${PORT};/g" /etc/nginx/http.d/default.conf
sed -i "s/listen \[::\]:80;/listen \[::\]:${PORT};/g" /etc/nginx/http.d/default.conf

# SQLite fallback if no external DB configured
if [ "$DB_CONNECTION" = "sqlite" ] || ([ -z "$DB_CONNECTION" ] && [ -z "$DATABASE_URL" ] && [ -z "$DB_HOST" ]); then
    echo "===> Ensuring SQLite database file exists..."
    mkdir -p /var/www/html/database
    touch /var/www/html/database/database.sqlite
    chown -R www-data:www-data /var/www/html/database
fi

# Ensure storage directories and permissions
echo "===> Setting permissions..."
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

# Create storage symlink
echo "===> Linking storage..."
php artisan storage:link --force || true

# Check APP_KEY
if [ -z "$APP_KEY" ]; then
    echo "WARNING: APP_KEY is not set. Generating a temporary key for startup..."
    php artisan key:generate --force || true
fi

# Run database migrations
echo "===> Running migrations..."
php artisan migrate --force || echo "===> Migration completed or skipped."

# Cache configurations in production
if [ "$APP_ENV" = "production" ]; then
    echo "===> Optimizing configuration for production..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

echo "===> Starting Nginx and PHP-FPM via supervisord..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
