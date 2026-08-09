<?php

namespace App\Domain\Appointments;

use App\Models\StaffBookingDay;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;

class BookingLock
{
    public function acquire(
        int $staffProfileId,
        CarbonImmutable $blockedStartsAt,
        CarbonImmutable $blockedEndsAt,
        string $timezone,
    ): void {
        $localStart = $blockedStartsAt->setTimezone($timezone)->startOfDay();
        $localEnd = $blockedEndsAt->setTimezone($timezone)->startOfDay();

        $dates = [];

        foreach (CarbonPeriod::create($localStart, '1 day', $localEnd) as $date) {
            $dates[] = CarbonImmutable::instance($date)->toDateString();
        }

        sort($dates);

        foreach ($dates as $date) {
            DB::table('staff_booking_days')->insertOrIgnore([
                'staff_profile_id' => $staffProfileId,
                'booking_date' => $date,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        StaffBookingDay::query()
            ->where('staff_profile_id', $staffProfileId)
            ->whereIn('booking_date', $dates)
            ->orderBy('booking_date')
            ->lockForUpdate()
            ->get();
    }
}
