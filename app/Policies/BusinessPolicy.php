<?php

namespace App\Policies;

use App\Enums\MembershipRole;
use App\Models\Business;
use App\Models\User;

class BusinessPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('platform-admin') ? true : null;
    }

    public function view(User $user, Business $business): bool
    {
        return $this->hasMembership($user, $business);
    }

    public function update(User $user, Business $business): bool
    {
        return $this->hasMembership($user, $business, [MembershipRole::Owner, MembershipRole::Manager]);
    }

    public function archive(User $user, Business $business): bool
    {
        return $this->hasMembership($user, $business, [MembershipRole::Owner]);
    }

    public function restore(User $user, Business $business): bool
    {
        return $this->archive($user, $business);
    }

    /** @param list<MembershipRole> $roles */
    private function hasMembership(User $user, Business $business, array $roles = []): bool
    {
        return $user->memberships()
            ->where('business_id', $business->getKey())
            ->where('status', 'active')
            ->when($roles, fn ($query) => $query->whereIn(
                'role',
                array_map(fn (MembershipRole $role) => $role->value, $roles),
            ))
            ->exists();
    }
}
