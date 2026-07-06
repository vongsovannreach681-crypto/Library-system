<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function index(){
        $user = User::all();
        return \response()->json($user, 200);
    }

    public function delete($id){
        $user = User::find($id);
        if(!$user){
            return response(["message"=>"User Not Found"], 404);

        }
        $user->delete();
        return response(["message"=>"Delete Successfull"], 201);

    }
}
