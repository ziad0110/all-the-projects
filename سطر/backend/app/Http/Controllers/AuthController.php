<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    private $adminPassword = 'password';

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        if ($request->password === $this->adminPassword) {
            return response()->json([
                'success' => true,
                'token' => 'admin-token-' . time()
            ]);
        }

        return response()->json(['error' => 'Invalid password'], 401);
    }

    public function logout()
    {
        return response()->json(['success' => true]);
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid data'], 400);
        }

        if ($request->current_password !== $this->adminPassword) {
            return response()->json(['error' => 'Current password incorrect'], 401);
        }

        return response()->json(['success' => true, 'message' => 'Password updated']);
    }
}
