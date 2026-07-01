<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Call;

class CallController extends Controller
{
    // ✅ GET ALL CALLS (FILTER + PAGINATION + FRONTEND SAFE)
    public function index(Request $request)
    {
        $query = Call::with('customer')
            ->where('user_id', auth()->id())
            ->latest();

        // 🔍 Filter: Customer
        if ($request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }

        // 🔍 Filter: Status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // 🔍 Filter: Date (single date)
        if ($request->date) {
            $query->whereDate('created_at', $request->date);
        }

        // 🔍 Filter: Date range
        if ($request->from_date && $request->to_date) {
            $query->whereBetween('created_at', [
                $request->from_date,
                $request->to_date
            ]);
        }

        $calls = $query->paginate(

            request(
               'per_page',
                50000
            )
        );

        return response()->json([
            'status' => true,
            'message' => 'Calls fetched successfully',

            // ✅ FRONTEND SAFE
            'data' => $calls->items(),

            // ✅ PAGINATION META
            'meta' => [
                'current_page' => $calls->currentPage(),
                'last_page' => $calls->lastPage(),
                'per_page' => $calls->perPage(),
                'total' => $calls->total(),
            ]
        ]);
    }

    // ✅ STORE NEW CALL
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id'    => 'required|exists:customers,id',
            'notes'          => 'nullable|string|max:1000',
            'status'         => 'required|in:pending,follow_up,completed',
            'follow_up_date' => 'nullable|date',
        ]);

        $validated['user_id'] = auth()->id();

        $call = Call::create($validated);
        $call->load('customer');

        return response()->json([
            'status'  => true,
            'message' => 'Call added successfully',
            'data'    => $call
        ], 201);
    }

    // ✅ SHOW SINGLE CALL
    public function show($id)
    {
        $call = Call::with('customer')
            ->where('user_id', auth()->id())
            ->findOrFail($id);

        return response()->json([
            'status' => true,
            'data'   => $call
        ]);
    }

    // ✅ UPDATE CALL
    public function update(Request $request, $id)
    {
        $call = Call::where('user_id', auth()->id())
            ->findOrFail($id);

        $validated = $request->validate([
            'notes'          => 'nullable|string|max:1000',
            'status'         => 'required|in:pending,follow_up,completed',
            'follow_up_date' => 'nullable|date',
        ]);

        $call->update($validated);
        $call->load('customer');

        return response()->json([
            'status'  => true,
            'message' => 'Call updated successfully',
            'data'    => $call
        ]);
    }

    // ✅ DELETE CALL
    public function destroy($id)
    {
        $call = Call::where('user_id', auth()->id())
            ->findOrFail($id);

        $call->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Call deleted successfully'
        ]);
    }
}