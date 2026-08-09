<?php

namespace App\Support;

use App\Models\Business;
use App\Models\User;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CurrentBusiness
{
    public function for(User $user): ?Business
    {
        return $user->memberships()
            ->where('status', 'active')
            ->with('business')
            ->latest('joined_at')
            ->first()
            ?->business;
    }

    public function forOrFail(User $user): Business
    {
        return $this->for($user)
            ?? throw new HttpException(403, 'Complete business onboarding before accessing this workspace.');
    }
}
