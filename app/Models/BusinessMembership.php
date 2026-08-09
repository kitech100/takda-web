<?php

namespace App\Models;

use App\Enums\MembershipRole;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property MembershipRole $role
 * @property-read Business $business
 */
#[Fillable(['business_id', 'user_id', 'role', 'status', 'invited_by', 'joined_at'])]
class BusinessMembership extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'role' => MembershipRole::class,
            'joined_at' => 'datetime',
        ];
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
}
