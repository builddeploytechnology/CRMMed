<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|exists:customers,id',

            'items' => 'required|array|min:1',

            // ✅ FIXED FIELD NAME
            'items.*.product_name' => 'required|string|max:255',

            'items.*.quantity' => 'required|integer|min:1',

            'items.*.price' => 'required|numeric|min:0'
        ];
    }

    // ✅ OPTIONAL (better error messages)
    public function messages(): array
    {
        return [
            'customer_id.required' => 'Please select a customer',

            'items.required' => 'Add at least one item',

            'items.*.product_name.required' => 'Product name is required',

            'items.*.quantity.required' => 'Quantity is required',
            'items.*.quantity.min' => 'Quantity must be at least 1',

            'items.*.price.required' => 'Price is required',
        ];
    }
}