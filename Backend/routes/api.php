<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BooksController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\FollowsController;
use App\Http\Controllers\LikesController;
use App\Http\Controllers\ChatbotController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/posts', [PostController::class, 'index']);
Route::post('/chatbot', [ChatbotController::class, 'respond']);
Route::get('/get-all-categories', [CategoryController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/user/{id}', [AuthController::class, 'updateProfile']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::get('/favorites/{bookId}/status', [FavoriteController::class, 'status']);
    Route::post('/favorites/{bookId}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{bookId}', [FavoriteController::class, 'destroy']);

    Route::get('/get-comments', [CommentController::class, 'index']);
    Route::delete('/delete-comments/{id}', [CommentController::class, 'destroy']);

    Route::get('/posts/{id}', [PostController::class, 'show']);
    
    // CORRECTED: Unified to a clean standard endpoint name
    Route::post('/comments', [CommentController::class, 'store']); 
    
    Route::post('/posts', [PostController::class, 'store']);
    // Route::get('/posts{id}', [PostController::class, '']);
    Route::put('/posts/{id}', [PostController::class, 'update']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    Route::post('/add-book', [BooksController::class, 'store']);

    // Follows
    Route::post('/users/{id}/follow',    [FollowsController::class, 'toggle']);
    Route::get('/users/{id}/followers',  [FollowsController::class, 'followers']);
    Route::get('/users/{id}/following',  [FollowsController::class, 'following']);
 
    // Likes
    Route::post('/posts/{id}/like',  [LikesController::class, 'toggle']);
    Route::get('/posts/{id}/likes',  [LikesController::class, 'index']);
});

Route::get('/get-all-books', [BooksController::class, 'index']);
Route::get('/search-books', [BooksController::class, 'search']);
Route::get('/get-book/{id}', [BooksController::class, 'show']);

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Admin features for books
    Route::put('/update-book/{id}', [BooksController::class, 'update']);
    Route::delete('/delete-book/{id}', [BooksController::class, 'destroy']);

    // API routes for categories
    Route::post('/add-category', [CategoryController::class, 'store']);
    Route::get('/get-one-category/{id}', [CategoryController::class, 'show']);
    Route::put('/update-category/{id}', [CategoryController::class, 'update']);
    Route::delete('/delete-category/{id}', [CategoryController::class, 'destroy']);

    // Admin user control
    Route::get('/get-all-users', [UserController::class, 'index']);
    Route::delete('/delete-user/{id}', [UserController::class, 'delete']);
    Route::put('/update-user/{id}', [UserController::class, 'updateProfile']);
});
