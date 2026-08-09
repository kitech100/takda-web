<?php

namespace App\Models;

use App\Models\Concerns\HasPublicId;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string $public_id
 * @property int $user_id
 * @property int $completed_visits
 * @property CarbonImmutable|null $last_visited_at
 * @property CarbonImmutable|null $deleted_at
 * @property-read User $user
 */
#[Fillable(['business_id', 'user_id', 'internal_notes', 'completed_visits', 'last_visited_at'])]
class BusinessCustomer extends Model
{
    use HasPublicId, SoftDeletes;

    protected function casts(): array
    {
        return ['last_visited_at' => 'immutable_datetime'];
    }

    /** @return BelongsTo<Business, $this> */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<Appointment, $this> */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
