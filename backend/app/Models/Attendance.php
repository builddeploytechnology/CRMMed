<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date', // ✅ ADD THIS (IMPORTANT)
        'login_time',
        'logout_time',
        'working_hours'
    ];

    protected $casts = [
        'login_time' => 'datetime',
        'logout_time' => 'datetime',
        'date' => 'date', // ✅ ADD THIS
    ];

    // ✅ RELATION: Attendance belongs to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}