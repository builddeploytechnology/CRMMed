<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reminder;
use App\Http\Requests\StoreReminderRequest;

class ReminderController extends Controller
{
    // Get all reminders of logged-in user
    public function index(Request $request)
    {
        $query = Reminder::with('customer')
            ->where('user_id', auth()->id());

        // Filter by status if needed
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $reminders = $query->orderBy('reminder_datetime')->get();

        return response()->json([
            'status' => true,
            'data' => $reminders
        ]);
    }

    // Create New Reminder
    public function store(StoreReminderRequest $request)
    {
        $reminder = Reminder::create([
            'user_id'           => auth()->id(),
            'customer_id'       => $request->customer_id,
            'type'              => $request->type,
            'reminder_datetime' => $request->reminder_datetime,
            'notes'             => $request->notes,
            'status'            => 'pending',
        ]);

        $reminder->load('customer');

        return response()->json([
            'status'  => true,
            'message' => 'Reminder created successfully',
            'data'    => $reminder
        ], 201);
    }

    // Update Reminder Status (Pending → Follow-up / Completed)
    public function updateStatus(Request $request, $id)
    {
        $reminder = Reminder::where('user_id', auth()->id())->findOrFail($id);

        $reminder->update([
            'status' => $request->status,
            'notes'  => $request->notes ?? $reminder->notes,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Reminder status updated',
            'data'    => $reminder
        ]);
    }

    // Mark Reminder as Completed
    public function markDone($id)
    {
        $reminder = Reminder::where('user_id', auth()->id())->findOrFail($id);

        $reminder->update([
            'status' => 'done',
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Reminder marked as completed',
            'data'    => $reminder
        ]);
    }
}
