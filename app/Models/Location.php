<?php

namespace App\Models;

use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'business_id', 'name', 'slug', 'email', 'phone', 'address_line_1', 'address_line_2',
    'barangay', 'city', 'province', 'postal_code', 'country_code', 'timezone',
    'opening_hours', 'is_active',
])]
class Location extends Model
{
    use HasPublicId, SoftDeletes;

    protected function casts(): array
    {
        return ['opening_hours' => 'array', 'is_active' => 'boolean'];
    }

    /** @return BelongsTo<Business, $this> */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /** @return BelongsToMany<StaffProfile, $this> */
    public function staffProfiles(): BelongsToMany
    {
        return $this->belongsToMany(StaffProfile::class, 'location_staff')->withTimestamps();
    }

    /** @return HasMany<Appointment, $this> */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
