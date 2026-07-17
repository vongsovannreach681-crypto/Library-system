<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\Request;

class LikesController extends Controller
{
    // POST /api/posts/{id}/like — toggles like/unlike
    public function toggle(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        $user = $request->user();

        $existing = Like::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
            $message = 'Post unliked';
        } else {
            Like::create([
                'user_id' => $user->id,
                'post_id' => $post->id,
            ]);
            $liked = true;
            $message = 'Post liked';
        }

        return response()->json([
            'liked'       => $liked,
            'likes_count' => $post->likes()->count(),
            'message'     => $message,
        ]);
    }

    // GET /api/posts/{id}/likes — list users who liked a post
    public function index($id)
    {
        $post = Post::findOrFail($id);

        $likes = $post->likes()->with('user')->paginate(20);

        return response()->json($likes);
    }
}
