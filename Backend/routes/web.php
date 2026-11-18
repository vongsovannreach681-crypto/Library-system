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
