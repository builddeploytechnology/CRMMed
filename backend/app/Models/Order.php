<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'user_id',       // ✅ IMPORTANT ADD
        'total_amount'
    ];

    // ✅ RELATION: Order belongs to Customer
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    // ✅ RELATION: Order has many items
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // ✅ OPTIONAL: Order belongs to User (best practice)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}