<?php

namespace App\Jobs;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Business;
use App\Models\BusinessCustomer;
use App\Models\DailyBusinessMetric;
use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AggregateDailyBusinessMetrics implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [60, 300, 900];

    public function __construct(public readonly string $date) {}

    public function uniqueId(): string
    {
        return $this->date;
    }

    public function handle(): void
    {
        Business::query()
            ->where('status', 'active')
            ->eachById(function (Business $business): void {
                $start = CarbonImmutable::parse($this->date, $business->timezone)->startOfDay()->utc();
                $end = $start->setTimezone($business->timezone)->addDay()->utc();

                $appointments = Appointment::query()
                    ->where('business_id', $business->getKey())
                    ->where('starts_at', '>=', $start)
                    ->where('starts_at', '<', $end);

                DailyBusinessMetric::updateOrCreate(
                    [
                        'business_id' => $business->getKey(),
                        'scope' => 'all',
                        'metric_date' => $this->date,
                    ],
                    [
                        'location_id' => null,
                        'appointments_count' => (clone $appointments)->count(),
                        'completed_count' => (clone $appointments)->where('status', AppointmentStatus::Completed)->count(),
                        'cancelled_count' => (clone $appointments)->where('status', AppointmentStatus::Cancelled)->count(),
                        'no_show_count' => (clone $appointments)->where('status', AppointmentStatus::NoShow)->count(),
                        'revenue_minor' => (int) (clone $appointments)
                            ->where('status', AppointmentStatus::Completed)
                            ->sum('price_minor'),
                        'new_customers_count' => BusinessCustomer::query()
                            ->where('business_id', $business->getKey())
                            ->where('created_at', '>=', $start)
                            ->where('created_at', '<', $end)
                            ->count(),
                    ],
                );
            });
    }
}
