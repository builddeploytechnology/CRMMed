<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Call extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'notes',
        'status',
        'follow_up_date',
        'user_id' // ✅ IMPORTANT
    ];

    protected $casts = [
        'follow_up_date' => 'datetime',
    ];

    /**
     * 🔥 AUTO SET USER_ID (MAIN FIX)
     */
    protected static function booted()
    {
        static::creating(function ($call) {
            if (auth()->check()) {
                $call->user_id = auth()->id();
            } else {
                // fallback (optional - avoid DB error)
                $call->user_id = 1;
            }
        });
    }

    // ✅ RELATION: Call belongs to Customer
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    // ✅ RELATION: Call belongs to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}