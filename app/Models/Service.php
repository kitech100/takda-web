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
    'business_id', 'service_category_id', 'name', 'slug', 'description', 'price_minor',
    'currency', 'duration_minutes', 'buffer_before_minutes', 'buffer_after_minutes', 'is_visible',
])]
class Service extends Model
{
    use HasPublicId, SoftDeletes;

    protected function casts(): array
    {
        return ['is_visible' => 'boolean'];
    }

    /** @return BelongsTo<Business, $this> */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /** @return BelongsTo<ServiceCategory, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    /** @return BelongsToMany<StaffProfile, $this> */
    public function staffProfiles(): BelongsToMany
    {
        return $this->belongsToMany(StaffProfile::class, 'staff_services')->withPivot([
            'price_override_minor', 'duration_override_minutes',
        ])->withTimestamps();
    }

    /** @return HasMany<Appointment, $this> */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
