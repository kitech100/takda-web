<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'business_id', 'location_id', 'scope', 'metric_date', 'appointments_count',
    'completed_count', 'cancelled_count', 'no_show_count', 'revenue_minor',
    'new_customers_count',
])]
class DailyBusinessMetric extends Model
{
    protected function casts(): array
    {
        return ['metric_date' => 'immutable_date'];
    }

    /** @return BelongsTo<Business, $this> */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
