<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CallController;
use App\Http\Controllers\Api\ReminderController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\StockController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

// Unauthenticated response
Route::get('/login', function () {
    return response()->json([
        'status' => false,
        'message' => 'Unauthenticated. Please login.'
    ], 401);
})->name('login');

// Auth
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

/*
|--------------------------------------------------------------------------
| PUBLIC STOCK ROUTES
|--------------------------------------------------------------------------
| Orders page ke dropdown ke liye public rakha hai
*/

Route::apiResource('stocks', StockController::class);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // ================= AUTH =================
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // ================= CUSTOMERS =================
    Route::apiResource('customers', CustomerController::class);

    Route::get('/customers/all', [
        CustomerController::class,
        'all'
    ]);

    // ================= CALLS =================
    Route::apiResource('calls', CallController::class);

    // ================= REMINDERS =================
    Route::apiResource('reminders', ReminderController::class);

    Route::post(
        'reminders/{id}/done',
        [ReminderController::class, 'markDone']
    );

    // ================= ORDERS =================
    Route::apiResource('orders', OrderController::class);

    // ================= ATTENDANCE =================
    Route::get(
        'attendance',
        [AttendanceController::class, 'index']
    );

    Route::post(
        'attendance/login',
        [AttendanceController::class, 'login']
    );

    Route::post(
        'attendance/logout',
        [AttendanceController::class, 'logout']
    );
});