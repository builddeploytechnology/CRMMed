<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReminderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id'       => 'required|exists:customers,id',
            'type'              => 'required|in:call,meeting,task,payment,other',
            'reminder_datetime' => 'required|date|after:now',  
            'notes'             => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'reminder_datetime.required' => 'Reminder date and time zaroori hai.',
            'reminder_datetime.after'    => 'Reminder future mein hona chahiye.',
        ];
    }
}