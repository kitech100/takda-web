<?php

namespace App\Actions\Appointments;

use App\Domain\Appointments\AppointmentConflictChecker;
use App\Domain\Appointments\BookingLock;
use App\Enums\AppointmentStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\AppointmentConflictException;
use App\Models\Appointment;
use App\Models\Business;
use App\Models\BusinessCustomer;
use App\Models\Location;
use App\Models\Service;
use App\Models\StaffProfile;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

readonly class CreateAppointment
{
    public function __construct(
        private BookingLock $bookingLock,
        private AppointmentConflictChecker $conflictChecker,
    ) {}

    public function execute(
        User $customer,
        Business $business,
        Location $location,
        Service $service,
        StaffProfile $staffProfile,
        CarbonImmutable $startsAt,
        ?string $customerNotes = null,
        string $source = 'mobile',
    ): Appointment {
        $this->assertSelectionBelongsToBusiness($business, $location, $service, $staffProfile);

        $assignment = $staffProfile->services()->whereKey($service->getKey())->first();

        if (! $assignment || ! $staffProfile->locations()->whereKey($location->getKey())->exists()) {
            throw new InvalidArgumentException('The selected staff member cannot provide this service at this location.');
        }

        $duration = $assignment->pivot->duration_override_minutes ?? $service->duration_minutes;
        $price = $assignment->pivot->price_override_minor ?? $service->price_minor;
        $startsAt = $startsAt->utc();
        $endsAt = $startsAt->addMinutes($duration);
        $blockedStartsAt = $startsAt->subMinutes($service->buffer_before_minutes);
        $blockedEndsAt = $endsAt->addMinutes($service->buffer_after_minutes);

        return DB::transaction(function () use (
            $customer,
            $business,
            $location,
            $service,
            $staffProfile,
            $startsAt,
            $endsAt,
            $blockedStartsAt,
            $blockedEndsAt,
            $price,
            $customerNotes,
            $source,
        ): Appointment {
            $this->bookingLock->acquire(
                $staffProfile->getKey(),
                $blockedStartsAt,
                $blockedEndsAt,
                $location->timezone,
            );

            if ($this->conflictChecker->hasConflict(
                $staffProfile->getKey(),
                $blockedStartsAt,
                $blockedEndsAt,
            )) {
                throw new AppointmentConflictException;
            }

            $businessCustomer = BusinessCustomer::withTrashed()->firstOrCreate(
                ['business_id' => $business->getKey(), 'user_id' => $customer->getKey()],
            );

            if ($businessCustomer->trashed()) {
                $businessCustomer->restore();
            }

            $appointment = Appointment::create([
                'reference' => $this->makeReference(),
                'business_id' => $business->getKey(),
                'location_id' => $location->getKey(),
                'service_id' => $service->getKey(),
                'staff_profile_id' => $staffProfile->getKey(),
                'customer_user_id' => $customer->getKey(),
                'business_customer_id' => $businessCustomer->getKey(),
                'status' => $business->confirmation_mode === 'automatic'
                    ? AppointmentStatus::Confirmed
                    : AppointmentStatus::Pending,
                'payment_status' => PaymentStatus::Unpaid,
                'source' => $source,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'blocked_starts_at' => $blockedStartsAt,
                'blocked_ends_at' => $blockedEndsAt,
                'timezone' => $location->timezone,
                'price_minor' => $price,
                'currency' => $service->currency ?? $business->currency ?? 'PHP',
                'customer_notes' => $customerNotes,
            ]);

            $appointment->events()->create([
                'actor_user_id' => $customer->getKey(),
                'event_type' => 'appointment.created',
                'properties' => ['source' => $source],
            ]);

            return $appointment->load(['business', 'location', 'service', 'staffProfile']);
        }, 3);
    }

    private function assertSelectionBelongsToBusiness(
        Business $business,
        Location $location,
        Service $service,
        StaffProfile $staffProfile,
    ): void {
        foreach ([$location, $service, $staffProfile] as $model) {
            if ((int) $model->business_id !== (int) $business->getKey()) {
                throw new InvalidArgumentException('The booking selection contains records from different businesses.');
            }
        }
    }

    private function makeReference(): string
    {
        do {
            $reference = 'TKD-'.Str::upper(Str::random(10));
        } while (Appointment::withTrashed()->where('reference', $reference)->exists());

        return $reference;
    }
}
