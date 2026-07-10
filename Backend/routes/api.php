<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BooksController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/user/{id}', [AuthController::class, 'updateProfile']);
});

Route::get('/get-all-books', [BooksController::class, 'index']);
Route::get('/get-book/{id}', [BooksController::class, 'show']);
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // admin features for books
    Route::post('/add-book', [BooksController::class, 'store']);
    Route::put('/update-book/{id}', [BooksController::class, 'update']);
    Route::delete('/delete-book/{id}', [BooksController::class, 'destroy']);

    // api routes for categories
    Route::get('/get-all-categories', [CategoryController::class, 'index']);
    Route::post('/add-category', [CategoryController::class, 'store']);
    Route::get('/get-one-category/{id}', [CategoryController::class, 'show']);
    Route::put('/update-category/{id}', [CategoryController::class, 'update']);
    Route::delete('/delete-category/{id}', [CategoryController::class, 'destroy']);

    // Control on user

    
    Route::get('/get-all-users', [UserController::class, 'index']);
    Route::delete('/delete-user/{id}', [UserController::class, 'delete']);
    });


