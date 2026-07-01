<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // ✅ GET ALL ATTENDANCE (USER-WISE)
    public function index(Request $request)
    {
        $query = Attendance::with('user')
            ->where('user_id', auth()->id()) // 🔥 MAIN FIX
            ->latest();

        // (Optional future) admin override
        // if ($request->user_id) {
        //     $query->where('user_id', $request->user_id);
        // }

        $attendances = $query->paginate(10);

        return response()->json([
            'status' => true,
            'data' => $attendances->items(),
            'meta' => [
                'current_page' => $attendances->currentPage(),
                'last_page' => $attendances->lastPage(),
                'per_page' => $attendances->perPage(),
                'total' => $attendances->total(),
            ]
        ]);
    }

    // ✅ LOGIN (START WORK)
    public function login(Request $request)
    {
        if (!auth()->check()) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $userId = auth()->id();

        // ✅ already logged in today check
        $existing = Attendance::where('user_id', $userId)
            ->whereDate('date', today())
            ->whereNull('logout_time')
            ->first();

        if ($existing) {
            return response()->json([
                'status' => false,
                'message' => 'Already logged in today'
            ], 400);
        }

        $attendance = Attendance::create([
            'user_id' => $userId,
            'date' => today(),
            'login_time' => now()
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Login recorded',
            'data' => $attendance
        ]);
    }

    // ✅ LOGOUT (END WORK)
    public function logout(Request $request)
    {
        if (!auth()->check()) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $userId = auth()->id();

        $attendance = Attendance::where('user_id', $userId)
            ->whereDate('date', today())
            ->whereNull('logout_time')
            ->first();

        if (!$attendance) {
            return response()->json([
                'status' => false,
                'message' => 'No active login found'
            ], 400);
        }

        $logoutTime = now();

        // ✅ working hours calculate
        $minutes = Carbon::parse($attendance->login_time)
            ->diffInMinutes($logoutTime);

        $hours = round($minutes / 60, 2);

        $attendance->update([
            'logout_time' => $logoutTime,
            'working_hours' => $hours
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Logout recorded',
            'data' => $attendance
        ]);
    }

    // ✅ SHOW (SECURE)
    public function show($id)
    {
        $attendance = Attendance::where('user_id', auth()->id()) // 🔥 FIX
            ->findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => $attendance
        ]);
    }

    // ✅ DELETE (OPTIONAL + SECURE)
    public function destroy($id)
    {
        $attendance = Attendance::where('user_id', auth()->id()) // 🔥 FIX
            ->findOrFail($id);

        $attendance->delete();

        return response()->json([
            'status' => true,
            'message' => 'Attendance deleted'
        ]);
    }
}