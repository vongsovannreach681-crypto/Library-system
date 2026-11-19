<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20|Unique:users',
            'password' => 'required|string|min:8',
            'profile' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $profilePath = null;
        if ($request->hasFile('profile')) {
            $profilePath = \App\Services\CloudUploadService::upload($request->file('profile'), 'profiles');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'profile' => $profilePath,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $passwordMatches = false;

        try {
            $passwordMatches = Hash::check($request->password, $user->password);
        } catch (\Throwable $e) {
            // Password in DB is plain-text or does not use standard bcrypt algorithm
            if ($user->password === $request->password) {
                $passwordMatches = true;
                $user->password = Hash::make($request->password);
                $user->save();
            }
        }

        // Direct fallback check if plain text matches
        if (!$passwordMatches && $user->password === $request->password) {
            $passwordMatches = true;
            $user->password = Hash::make($request->password);
            $user->save();
        }

        if (!$passwordMatches) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Ensure default admin user has admin role
        if ($user->email === 'vongsovannreach681@gmail.com' && $user->role !== 'admin') {
            $user->role = 'admin';
            $user->save();
        }

        // Upgrade hash if algorithm needs rehashing
        try {
            if (Hash::needsRehash($user->password)) {
                $user->password = Hash::make($request->password);
                $user->save();
            }
        } catch (\Throwable $e) {
            // Ignore rehash inspection errors
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Check if user is updating their own profile
        if ($request->user()->id !== (int)$id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'phone' => 'required|string|max:20|unique:users,phone,' . $id,
            'profile' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;

        if ($request->hasFile('profile')) {
            $user->profile = \App\Services\CloudUploadService::upload($request->file('profile'), 'profiles', $user->profile);
        }

        $user->save();

        return response()->json([
            'user' => $user,
            'message' => 'Profile updated successfully'
        ]);
    }
}