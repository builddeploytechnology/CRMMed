<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'customer' => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'phone' => $this->customer->phone
            ],

            // 👉 direct items without separate resource
            'items' => $this->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'medicine_name' => $item->medicine_name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $item->quantity * $item->price
                ];
            }),

            'total_amount' => $this->total_amount,

            'created_at' => $this->created_at->format('Y-m-d H:i')
        ];
    }
}