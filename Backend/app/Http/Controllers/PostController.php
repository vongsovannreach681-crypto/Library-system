<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $followingIds = $user->following()->pluck('users.id');
        $feedIds = $followingIds->push($user->id);

        $posts = Post::with(['user', 'comments.user'])
            ->withCount(['likes', 'comments'])
            ->whereIn('user_id', $feedIds)
            ->latest()
            ->paginate(15);

        $posts->getCollection()->transform(function ($post) use ($user) {
            $post->liked_by_me = $post->isLikedBy($user);
            return $post;
        });

        return response()->json($posts);
    }

    // POST /api/posts
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:5000',
            'image'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts', 'public');
        }

        $post = Post::create([
            'user_id'   => $request->user()->id,
            'content'   => $request->content,
            'image_url' => $imagePath,
        ]);

        return response()->json([
            'post'    => $post->load('user')->loadCount(['likes', 'comments']),
            'message' => 'Post created successfully',
        ], 201);
    }

    // GET /api/posts/{id}
    public function show(Request $request, $id)
    {
        $post = Post::with(['user', 'comments.user'])
            ->withCount(['likes', 'comments'])
            ->findOrFail($id);

        $post->liked_by_me = $request->user()
            ? $post->isLikedBy($request->user())
            : false;

        return response()->json($post);
    }

    // PUT /api/posts/{id}
    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        // Check if user owns this post
        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:5000',
            'image'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $post->content = $request->content;

        if ($request->hasFile('image')) {
            $currentImagePath = $post->getRawOriginal('image_url');
            if ($currentImagePath && Storage::disk('public')->exists($currentImagePath)) {
                Storage::disk('public')->delete($currentImagePath);
            }

            $post->image_url = $request->file('image')->store('posts', 'public');
        }

        $post->save();

        return response()->json([
            'post'    => $post->loadCount(['likes', 'comments']),
            'message' => 'Post updated successfully',
        ]);
    }

    // DELETE /api/posts/{id}
    public function destroy(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $currentImagePath = $post->getRawOriginal('image_url');
        if ($currentImagePath && Storage::disk('public')->exists($currentImagePath)) {
            Storage::disk('public')->delete($currentImagePath);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }
}
