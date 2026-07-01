<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // ✅ API routes enabled
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // ✅ Enable CORS (React connect ke liye)
        $middleware->append(HandleCors::class);

        // ✅ FIX: No redirect to /login (API mode)
        $middleware->redirectGuestsTo(function () {
            return null;
        });

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();