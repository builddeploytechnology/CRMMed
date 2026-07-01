<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, $role)
    {
        // Check user logged in
        if (!auth()->check()) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        // Check role
        if (auth()->user()->role !== $role) {
            return response()->json([
                'status' => false,
                'message' => 'Access denied'
            ], 403);
        }

        return $next($request);
    }
}