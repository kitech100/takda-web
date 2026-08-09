<?php

namespace App\Models;

use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $public_id
 * @property string $channel
 * @property string $template
 * @property string $status
 * @property Carbon|null $sent_at
 * @property-read User|null $user
 * @property-read Appointment|null $appointment
 */
#[Fillable([
    'user_id', 'appointment_id', 'channel', 'template', 'status',
    'provider_reference', 'failure_message', 'sent_at',
])]
class NotificationDelivery extends Model
{
    use HasPublicId;

    protected function casts(): array
    {
        return ['sent_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Appointment, $this> */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
