<?php

namespace App\Domain\Appointments;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use Carbon\CarbonImmutable;

class AppointmentConflictChecker
{
    public function hasConflict(
        int $staffProfileId,
        CarbonImmutable $blockedStartsAt,
        CarbonImmutable $blockedEndsAt,
        ?int $exceptAppointmentId = null,
    ): bool {
        return Appointment::query()
            ->when($exceptAppointmentId, fn ($query) => $query->where('id', '!=', $exceptAppointmentId))
            ->where('staff_profile_id', $staffProfileId)
            ->whereIn('status', array_map(
                fn (AppointmentStatus $status) => $status->value,
                AppointmentStatus::blocking(),
            ))
            ->where('blocked_starts_at', '<', $blockedEndsAt)
            ->where('blocked_ends_at', '>', $blockedStartsAt)
            ->exists();
    }
}
