<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'online',
        'message' => 'LibreShelf Backend API is running',
        'environment' => app()->environment(),
        'database' => config('database.default'),
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Storage fallback route for cloud deployments with ephemeral containers
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . ltrim($path, '/'));

    if (file_exists($fullPath) && !is_dir($fullPath)) {
        return response()->file($fullPath);
    }

    // Elegant fallback SVG when image is missing due to Render container redeployment
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
        <rect width="600" height="400" fill="#111827"/>
        <circle cx="300" cy="160" r="42" fill="#1f2937" stroke="#374151" stroke-width="2"/>
        <path d="M285 160h30M300 145v30" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
        <text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" fill="#f3f4f6" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="16" font-weight="700">Image Unavailable</text>
        <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="12">File was reset on server redeployment</text>
    </svg>';

    return response($svg, 200, [
        'Content-Type' => 'image/svg+xml',
        'Cache-Control' => 'no-cache, private',
    ]);
})->where('path', '.*');
