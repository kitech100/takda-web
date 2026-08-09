<?php

namespace App\Queries;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class DashboardQuery
{
    /** @return array<string, mixed> */
    public function for(User $user): array
    {
        $membership = $user->memberships()
            ->where('status', 'active')
            ->with('business')
            ->first();

        $business = $membership?->business;
        $canViewPlatform = $user->hasRole('platform-admin');

        $appointments = Appointment::query()
            ->when($business, fn (Builder $query) => $query->where('business_id', $business->getKey()))
            ->when(! $business && ! $canViewPlatform, fn (Builder $query) => $query->whereRaw('1 = 0'));

        $today = now()->utc()->toDateString();
        $todayQuery = (clone $appointments)->whereDate('starts_at', $today);

        return [
            'scope' => $business ? $business->name : ($canViewPlatform ? 'Takda platform' : 'No business selected'),
            'business' => $business ? $this->businessData($business) : null,
            'metrics' => [
                'today' => (clone $todayQuery)->count(),
                'confirmed' => (clone $todayQuery)->where('status', AppointmentStatus::Confirmed)->count(),
                'pending' => (clone $todayQuery)->where('status', AppointmentStatus::Pending)->count(),
                'completed' => (clone $todayQuery)->where('status', AppointmentStatus::Completed)->count(),
                'noShow' => (clone $todayQuery)->where('status', AppointmentStatus::NoShow)->count(),
                'revenueMinor' => (int) (clone $todayQuery)
                    ->where('status', AppointmentStatus::Completed)
                    ->sum('price_minor'),
            ],
            'upcoming' => (clone $appointments)
                ->with(['customer:id,name', 'service:id,name', 'staffProfile:id,display_name', 'location:id,name'])
                ->whereIn('status', array_map(
                    fn (AppointmentStatus $status) => $status->value,
                    AppointmentStatus::blocking(),
                ))
                ->where('starts_at', '>=', now()->utc())
                ->orderBy('starts_at')
                ->limit(8)
                ->get()
                ->map(static fn (Appointment $appointment): array => [
                    'id' => $appointment->public_id,
                    'reference' => $appointment->reference,
                    'customer' => $appointment->customer->name,
                    'service' => $appointment->service->name,
                    'staff' => $appointment->staffProfile->display_name,
                    'location' => $appointment->location->name,
                    'status' => $appointment->status->value,
                    'startsAt' => $appointment->starts_at->toIso8601String(),
                ])
                ->values()
                ->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function businessData(Business $business): array
    {
        return [
            'id' => $business->public_id,
            'name' => $business->name,
            'status' => $business->status->value,
            'currency' => $business->currency,
            'timezone' => $business->timezone,
        ];
    }
}
