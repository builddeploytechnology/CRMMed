<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $customerId = $this->route('customer') ?? $this->route('id');

        return [
            'name'     => 'required|string|max:255',
            'phone'    => [
                'required',
                'digits:10',
                'regex:/^[6-9]\d{9}$/',
                Rule::unique('customers', 'phone')->ignore($customerId)
            ],
            'city'     => 'required|string|max:100',
            'locality' => 'nullable|string|max:100',
            'address'  => 'nullable|string|max:500',
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'name.required'     => 'Customer ka naam zaroori hai.',
            'phone.required'    => 'Phone number zaroori hai.',
            'phone.digits'      => 'Phone number exactly 10 digits ka hona chahiye.',
            'phone.regex'       => 'Phone number valid Indian mobile number hona chahiye (6,7,8,9 se start).',
            'phone.unique'      => 'Yeh phone number already kisi aur customer ke paas hai.',
            'city.required'     => 'City select karna zaroori hai.',
            'name.string'       => 'Naam valid text hona chahiye.',
            'phone.string'      => 'Phone number valid text hona chahiye.',
        ];
    }
}