<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Comment::with(['user', 'post'])->latest();

        if ($request->filled('post_id')) {
            $query->where('post_id', $request->integer('post_id'));
        }

        return response()->json($query->get(), 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('Comment store entered', [
            'has_token' => $request->bearerToken() ? true : false,
            'auth_id' => optional($request->user('sanctum'))->id,
            'post_id' => $request->input('post_id'),
        ]);

        $user = $request->user('sanctum');
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|max:1000',
            'image'   => 'nullable|string|max:2048',
            'post_id' => 'required|exists:posts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $comment = Comment::create([
                'comment' => $request->comment,
                'image'   => $request->image,
                'post_id' => $request->post_id,
                'user_id' => $user->id,
            ]);

            return response()->json($comment->load(['user', 'post']), 201);
        } catch (\Throwable $e) {
            Log::error('Comment create failed', [
                'message' => $e->getMessage(),
                'user_id' => $user->id,
                'post_id' => $request->post_id,
            ]);

            return response()->json([
                'message' => 'Failed to create comment',
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Comment $comment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $comment = Comment::find($id);
        if(!$comment){
            return response()->json(["message" => "Comment not found!"], 404);
        }
        $comment->delete();
        return response()->json(["message" => "Comment deleted successfully!"], 200);
    }
}
