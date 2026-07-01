<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    protected function redirectTo(Request $request): ?string
    {
        return null; // ❌ no redirect
    }

    protected function unauthenticated($request, array $guards)
    {
        abort(response()->json([
            'status' => false,
            'message' => 'Unauthenticated. Please login.'
        ], 401));
    }
}