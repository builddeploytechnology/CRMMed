<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Customer extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',     // 🔥 Important - auth user ke liye
        'name',
        'phone',
        'address',
        'city',
        'locality'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'user_id' => 'integer',
    ];

    // ================= RELATIONSHIPS =================

    /**
     * Customer belongs to User (Owner)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Customer has many Calls
     */
    public function calls()
    {
        return $this->hasMany(Call::class);
    }

    /**
     * Customer has many Reminders
     */
    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }

    /**
     * Customer has many Orders
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // ================= SCOPES (Optional but Useful) =================

    /**
     * Scope to get only customers of logged-in user
     */
    public function scopeOwn($query)
    {
        return $query->where('user_id', auth()->id());
    }

    /**
     * Scope for searching in multiple columns
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%")
              ->orWhere('city', 'like', "%{$search}%")
              ->orWhere('locality', 'like', "%{$search}%");
        });
    }
}