<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class FollowsController extends Controller
{
    public function toggle(Request $request, $id)
    {
        $targetUser = User::findOrFail($id);
        $authUser = $request->user();
 
        if ($authUser->id === $targetUser->id) {
            return response()->json(['message' => 'You cannot follow yourself'], 422);
        }
 
        if ($authUser->isFollowing($targetUser)) {
            $authUser->following()->detach($targetUser->id);
            $following = false;
            $message = 'Unfollowed successfully';
        } else {
            $authUser->following()->attach($targetUser->id);
            $following = true;
            $message = 'Followed successfully';
        }
 
        return response()->json([
            'following'       => $following,
            'followers_count' => $targetUser->followers()->count(),
            'message'         => $message,
        ]);
    }
 
    // GET /api/users/{id}/followers
    public function followers($id)
    {
        $user = User::findOrFail($id);
 
        return response()->json(
            $user->followers()->paginate(20)
        );
    }
 
    // GET /api/users/{id}/following
    public function following($id)
    {
        $user = User::findOrFail($id);
 
        return response()->json(
            $user->following()->paginate(20)
        );
    }
}
