<?php

namespace App\Http\Controllers;

use App\Models\Books;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = Books::with('category')
            ->whereHas('favoritedBy', function ($query) use ($request) {
                $query->where('users.id', $request->user()->id);
            })
            ->latest()
            ->get()
            ->map(function ($book) {
                return $this->formatBookResponse($book);
            });

        return response()->json([
            'favorites' => $favorites,
        ]);
    }

    public function status(Request $request, $bookId)
    {
        $exists = $request->user()
            ->favoriteBooks()
            ->where('books.id', $bookId)
            ->exists();

        return response()->json([
            'favorited' => $exists,
        ]);
    }

    public function store(Request $request, $bookId)
    {
        $book = Books::find($bookId);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $request->user()->favoriteBooks()->syncWithoutDetaching([$bookId]);

        return response()->json([
            'message' => 'Book added to favorites',
            'favorited' => true,
        ], 201);
    }

    public function destroy(Request $request, $bookId)
    {
        $request->user()->favoriteBooks()->detach($bookId);

        return response()->json([
            'message' => 'Book removed from favorites',
            'favorited' => false,
        ]);
    }

    private function formatBookResponse(Books $book): array
    {
        $baseUrl = request()->getSchemeAndHttpHost();
        $coverUrl = $book->cover_image ? $baseUrl . '/storage/' . ltrim($book->cover_image, '/') : null;
        $pdfUrl = $book->pdf_file ? $baseUrl . '/storage/' . ltrim($book->pdf_file, '/') : null;

        return [
            'id' => $book->id,
            'title' => $book->title,
            'author' => $book->author,
            'Time_spent' => $book->Time_spent,
            'description' => $book->description,
            'star_rating' => $book->star_rating,
            'review' => $book->review,
            'release_date' => $book->release_date,
            'category_id' => $book->category_id,
            'category_name' => $book->category?->name,
            'cover_image' => $coverUrl,
            'pdf_file' => $pdfUrl,
            'created_at' => $book->created_at,
            'updated_at' => $book->updated_at,
        ];
    }
}
