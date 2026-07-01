<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Attendance;
use Carbon\Carbon;

class AutoLogoutAttendance extends Command
{
    protected $signature = 'attendance:auto-logout';
    protected $description = 'Auto logout users who forgot to logout';

    public function handle()
    {
        $attendances = Attendance::whereNull('logout_time')->get();

        foreach ($attendances as $attendance) {

            $logoutTime = now();

            $minutes = Carbon::parse($attendance->login_time)
                ->diffInMinutes($logoutTime);

            $hours = round($minutes / 60, 2);

            $attendance->update([
                'logout_time' => $logoutTime,
                'working_hours' => $hours
            ]);
        }

        $this->info('Auto logout done');
    }
}