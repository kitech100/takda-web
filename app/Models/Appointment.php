<?php

namespace App\Models;

use App\Enums\AppointmentStatus;
use App\Enums\PaymentStatus;
use App\Models\Concerns\HasPublicId;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string $public_id
 * @property string $reference
 * @property AppointmentStatus $status
 * @property PaymentStatus $payment_status
 * @property CarbonImmutable $starts_at
 * @property CarbonImmutable $ends_at
 * @property-read User $customer
 * @property-read Service $service
 * @property-read StaffProfile $staffProfile
 * @property-read Location $location
 */
#[Fillable([
    'reference', 'business_id', 'location_id', 'service_id', 'staff_profile_id',
    'customer_user_id', 'business_customer_id', 'status', 'payment_status', 'source',
    'starts_at', 'ends_at', 'blocked_starts_at', 'blocked_ends_at', 'timezone',
    'price_minor', 'currency', 'customer_notes', 'internal_notes', 'cancellation_reason',
    'cancelled_by', 'cancelled_at',
])]
class Appointment extends Model
{
    use HasPublicId, SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => AppointmentStatus::class,
            'payment_status' => PaymentStatus::class,
            'starts_at' => 'immutable_datetime',
            'ends_at' => 'immutable_datetime',
            'blocked_starts_at' => 'immutable_datetime',
            'blocked_ends_at' => 'immutable_datetime',
            'cancelled_at' => 'immutable_datetime',
        ];
    }

    /** @return BelongsTo<Business, $this> */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /** @return BelongsTo<Location, $this> */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /** @return BelongsTo<Service, $this> */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /** @return BelongsTo<StaffProfile, $this> */
    public function staffProfile(): BelongsTo
    {
        return $this->belongsTo(StaffProfile::class);
    }

    /** @return BelongsTo<User, $this> */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_user_id');
    }

    /** @return BelongsTo<BusinessCustomer, $this> */
    public function businessCustomer(): BelongsTo
    {
        return $this->belongsTo(BusinessCustomer::class);
    }

    /** @return HasMany<AppointmentEvent, $this> */
    public function events(): HasMany
    {
        return $this->hasMany(AppointmentEvent::class);
    }
}
