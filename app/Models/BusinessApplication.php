<?php

namespace App\Models;

use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property string $public_id
 * @property string $status
 * @property array<string, mixed> $submitted_data
 * @property Carbon|null $submitted_at
 * @property Carbon|null $reviewed_at
 * @property-read User $owner
 * @property-read Business $business
 */
#[Fillable([
    'owner_id', 'business_id', 'status', 'submitted_data', 'review_notes',
    'reviewed_by', 'submitted_at', 'reviewed_at',
])]
class BusinessApplication extends Model
{
    use HasPublicId, SoftDeletes;

    protected function casts(): array
    {
        return [
            'submitted_data' => 'array',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /** @return BelongsTo<Business, $this> */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /** @return BelongsTo<User, $this> */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
