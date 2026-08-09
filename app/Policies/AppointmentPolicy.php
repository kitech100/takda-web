<?php

namespace App\Policies;

use App\Enums\MembershipRole;
use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('platform-admin') ? true : null;
    }

    public function view(User $user, Appointment $appointment): bool
    {
        return $appointment->customer_user_id === $user->getKey()
            || $this->isBusinessMember($user, $appointment);
    }

    public function update(User $user, Appointment $appointment): bool
    {
        return $this->isBusinessMember($user, $appointment);
    }

    public function cancel(User $user, Appointment $appointment): bool
    {
        return $this->view($user, $appointment);
    }

    private function isBusinessMember(User $user, Appointment $appointment): bool
    {
        return $user->memberships()
            ->where('business_id', $appointment->business_id)
            ->where('status', 'active')
            ->whereIn('role', [
                MembershipRole::Owner->value,
                MembershipRole::Manager->value,
                MembershipRole::Receptionist->value,
                MembershipRole::Staff->value,
            ])
            ->exists();
    }
}
