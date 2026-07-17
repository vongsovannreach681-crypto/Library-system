<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
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
        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|max:1000',
            'image'   => 'nullable|string|max:2048',
            'post_id' => 'nullable|exists:posts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $comment = Comment::create([
            'comment' => $request->comment,
            'image'   => $request->image,
            'post_id' => $request->post_id,
            'user_id'  => $request->user()->id,
        ]);

        return response()->json($comment->load(['user', 'post']), 201);
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
