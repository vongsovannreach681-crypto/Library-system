<?php

namespace App\Http\Controllers;

use App\Models\Books;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BooksController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Books::with('category')->latest();

        if ($request->filled('limit')) {
            $limit = (int) $request->query('limit');
            if ($limit > 0) {
                $query->limit($limit);
            }
        }

        $books = $query->get()->map(function ($book) {
            return $this->formatBookResponse($book);
        });

        return response()->json($books, 200);
    }

    /**
     * Search books by title, author, or category name.
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:1',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $search = $request->query('query');
        $limit = (int) $request->query('limit', 10);

        $books = Books::with('category')
            ->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhereHas('category', function ($cat) use ($search) {
                      $cat->where('name', 'like', "%{$search}%");
                  });
            })
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($book) {
                return $this->formatBookResponse($book);
            });

        return response()->json($books, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'author' => 'required|string',
            'Time_spent' => 'nullable|string',
            'category_id' => 'required|exists:book_category,id',
            'description' => 'required|string',
            'cover_image' => 'required|file|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'pdf_file' => 'required|file|mimes:pdf|max:10000',
            'star_rating' => 'nullable|numeric|min:1|max:5',
            'review' => 'nullable|string',
            'release_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except(['cover_image', 'pdf_file']);

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $this->uploadFile($request->file('cover_image'), 'books/covers');
        }

        if ($request->hasFile('pdf_file')) {
            $data['pdf_file'] = $this->uploadFile($request->file('pdf_file'), 'books/pdfs');
        }

        $book = Books::create($data);
        return response()->json($this->formatBookResponse($book), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $book = Books::with('category')->find($id);
        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        return response()->json($this->formatBookResponse($book), 200);
    }
   

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $book = Books::find($id);
        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string',
            'author' => 'sometimes|required|string',
            'Time_spent' => 'nullable|string',
            'category_id' => 'sometimes|required|exists:book_category,id',
            'description' => 'sometimes|required|string',
            'cover_image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'pdf_file' => 'nullable|file|mimes:pdf|max:20000',
            'star_rating' => 'nullable|numeric|min:1|max:5',
            'review' => 'nullable|string',
            'release_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except(['cover_image', 'pdf_file']);

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $this->uploadFile($request->file('cover_image'), 'books/covers', $book->cover_image);
        }

        if ($request->hasFile('pdf_file')) {
            $data['pdf_file'] = $this->uploadFile($request->file('pdf_file'), 'books/pdfs', $book->pdf_file);
        }

        $book->update($data);
        return response()->json($this->formatBookResponse($book), 200);
    }
    

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $book = Books::find($id);
        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        if ($book->cover_image) {
            Storage::disk('public')->delete($book->cover_image);
        }

        if ($book->pdf_file) {
            Storage::disk('public')->delete($book->pdf_file);
        }

        $book->delete();
        return response()->json(['message' => 'Book deleted successfully'], 200);
    }

    private function uploadFile($file, string $folder, ?string $currentPath = null): string
    {
        if ($currentPath && Storage::disk('public')->exists($currentPath)) {
            Storage::disk('public')->delete($currentPath);
        }

        $fileName = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();

        return $file->storeAs($folder, $fileName, 'public');
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