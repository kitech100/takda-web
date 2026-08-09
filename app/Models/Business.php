<?php

namespace App\Models;

use App\Enums\BusinessStatus;
use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string $public_id
 * @property string $name
 * @property BusinessStatus $status
 * @property string $currency
 * @property string $timezone
 */
#[Fillable([
    'name', 'slug', 'description', 'email', 'phone', 'logo_path', 'cover_path',
    'timezone', 'currency', 'status', 'confirmation_mode', 'slot_interval_minutes',
    'booking_horizon_days', 'minimum_notice_minutes', 'cancellation_notice_minutes',
    'reminder_minutes', 'approved_by', 'approved_at', 'published_at',
])]
class Business extends Model
{
    use HasPublicId, SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => BusinessStatus::class,
            'reminder_minutes' => 'array',
            'approved_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    /** @return HasMany<BusinessMembership, $this> */
    public function memberships(): HasMany
    {
        return $this->hasMany(BusinessMembership::class);
    }

    /** @return HasMany<Location, $this> */
    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    /** @return HasMany<Service, $this> */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    /** @return HasMany<ServiceCategory, $this> */
    public function serviceCategories(): HasMany
    {
        return $this->hasMany(ServiceCategory::class);
    }

    /** @return HasMany<BusinessCustomer, $this> */
    public function customerProfiles(): HasMany
    {
        return $this->hasMany(BusinessCustomer::class);
    }

    /** @return HasMany<StaffProfile, $this> */
    public function staffProfiles(): HasMany
    {
        return $this->hasMany(StaffProfile::class);
    }

    /** @return HasMany<Appointment, $this> */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /** @return HasMany<BusinessApplication, $this> */
    public function applications(): HasMany
    {
        return $this->hasMany(BusinessApplication::class);
    }
}
