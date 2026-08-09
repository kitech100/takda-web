<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Business;
use App\Models\BusinessCustomer;
use App\Models\Location;
use App\Models\NotificationDelivery;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\StaffProfile;
use App\Support\CurrentBusiness;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class BusinessSectionController extends Controller
{
    /** @var array<string, array{title: string, description: string}> */
    private const SECTIONS = [
        'calendar' => ['title' => 'Calendar', 'description' => 'Manage the team schedule across locations.'],
        'appointments' => ['title' => 'Appointments', 'description' => 'Review, create, reschedule, and update appointments.'],
        'customers' => ['title' => 'Customers', 'description' => 'See customer profiles, history, and internal notes.'],
        'services' => ['title' => 'Services', 'description' => 'Configure services, durations, buffers, and prices.'],
        'staff' => ['title' => 'Staff', 'description' => 'Manage team members, services, and availability.'],
        'locations' => ['title' => 'Locations', 'description' => 'Configure branches, addresses, and opening hours.'],
        'analytics' => ['title' => 'Analytics', 'description' => 'Understand bookings, revenue, and utilization.'],
        'notifications' => ['title' => 'Notifications', 'description' => 'Monitor customer reminders and delivery status.'],
        'archived' => ['title' => 'Archived', 'description' => 'Restore archived services, staff, locations, and customers.'],
        'settings' => ['title' => 'Booking Rules', 'description' => 'Configure online booking, cancellation, and rescheduling rules.'],
    ];

    public function __invoke(Request $request, string $section, CurrentBusiness $currentBusiness): Response
    {
        abort_unless(array_key_exists($section, self::SECTIONS), 404);

        $business = $currentBusiness->forOrFail($request->user());

        return Inertia::render('business/section', [
            'section' => $section,
            ...self::SECTIONS[$section],
            'data' => match ($section) {
                'calendar', 'appointments' => $this->appointmentData($business),
                'customers' => $this->customerData($business),
                'services' => $this->serviceData($business),
                'staff' => $this->staffData($business),
                'locations' => $this->locationData($business),
                'analytics' => $this->analyticsData($business),
                'notifications' => $this->notificationData($business),
                'archived' => $this->archivedData($business),
                'settings' => $this->settingsData($business),
            },
        ]);
    }

    /** @return array<string, mixed> */
    private function appointmentData(Business $business): array
    {
        $appointments = $business->appointments()
            ->with(['businessCustomer:id,public_id', 'customer:id,public_id,name,email,phone', 'service:id,public_id,name,duration_minutes', 'staffProfile:id,public_id,display_name', 'location:id,public_id,name'])
            ->latest('starts_at')
            ->limit(100)
            ->get();

        return [
            'appointments' => $appointments->map(fn (Appointment $appointment): array => $this->appointmentRow($appointment))->all(),
            'customers' => $business->customerProfiles()->with('user:id,public_id,name,email,phone')->get()->map(fn (BusinessCustomer $customer): array => [
                'id' => $customer->public_id,
                'name' => $customer->user->name,
                'phone' => $customer->user->phone,
                'email' => $customer->user->email,
            ])->all(),
            'services' => $business->services()->with('staffProfiles:id,public_id')->where('is_visible', true)->get()->map(fn (Service $service): array => [
                'id' => $service->public_id,
                'name' => $service->name,
                'durationMinutes' => $service->duration_minutes,
                'priceMinor' => $service->price_minor,
                'staffIds' => $service->staffProfiles->pluck('public_id')->all(),
            ])->all(),
            'staff' => $business->staffProfiles()->with(['services:id,public_id', 'locations:id,public_id'])->where('is_bookable', true)->get()->map(fn (StaffProfile $staff): array => [
                'id' => $staff->public_id,
                'name' => $staff->display_name,
                'serviceIds' => $staff->services->pluck('public_id')->all(),
                'locationIds' => $staff->locations->pluck('public_id')->all(),
            ])->all(),
            'locations' => $business->locations()->where('is_active', true)->get(['public_id', 'name', 'timezone'])->map(fn (Location $location): array => [
                'id' => $location->public_id,
                'name' => $location->name,
                'timezone' => $location->timezone,
            ])->all(),
            'statuses' => collect(AppointmentStatus::cases())->map(fn (AppointmentStatus $status): array => [
                'value' => $status->value,
                'label' => str($status->value)->replace('_', ' ')->title()->toString(),
            ])->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function customerData(Business $business): array
    {
        return [
            'customers' => $business->customerProfiles()->with('user:id,public_id,name,email,phone')->latest()->get()->map(fn (BusinessCustomer $customer): array => [
                'id' => $customer->public_id,
                'initials' => $this->initials($customer->user->name),
                'name' => $customer->user->name,
                'phone' => $customer->user->phone,
                'email' => $customer->user->email,
                'visits' => $customer->completed_visits,
                'lastVisit' => $customer->last_visited_at?->toIso8601String(),
                'notes' => $customer->internal_notes,
                'status' => $customer->completed_visits >= 10 ? 'Loyal' : ($customer->completed_visits === 0 ? 'New' : 'Active'),
            ])->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function serviceData(Business $business): array
    {
        return [
            'categories' => $business->serviceCategories()->withCount('services')->orderBy('sort_order')->get()->map(fn ($category): array => [
                'id' => $category->public_id,
                'name' => $category->name,
                'servicesCount' => $category->services_count,
            ])->all(),
            'services' => $business->services()->with('category:id,public_id,name')->latest()->get()->map(fn (Service $service): array => [
                'id' => $service->public_id,
                'name' => $service->name,
                'description' => $service->description,
                'categoryId' => $service->category?->public_id,
                'category' => $service->getRelation('category') instanceof ServiceCategory ? $service->category->name : 'Uncategorized',
                'durationMinutes' => $service->duration_minutes,
                'priceMinor' => $service->price_minor,
                'bufferMinutes' => $service->buffer_after_minutes,
                'isVisible' => $service->is_visible,
            ])->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function staffData(Business $business): array
    {
        return [
            'staff' => $business->staffProfiles()->with(['user:id,public_id,email,phone', 'services:id,public_id,name', 'locations:id,public_id,name'])->latest()->get()->map(fn (StaffProfile $staff): array => [
                'id' => $staff->public_id,
                'initials' => $this->initials($staff->display_name),
                'name' => $staff->display_name,
                'title' => $staff->title,
                'email' => $staff->user?->email,
                'phone' => $staff->user?->phone,
                'isBookable' => $staff->is_bookable,
                'services' => $staff->services->map(fn (Service $service): array => ['id' => $service->public_id, 'name' => $service->name])->all(),
                'locations' => $staff->locations->map(fn (Location $location): array => ['id' => $location->public_id, 'name' => $location->name])->all(),
            ])->all(),
            'services' => $business->services()->get(['public_id', 'name'])->map(fn (Service $service): array => ['id' => $service->public_id, 'name' => $service->name])->all(),
            'locations' => $business->locations()->get(['public_id', 'name'])->map(fn (Location $location): array => ['id' => $location->public_id, 'name' => $location->name])->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function locationData(Business $business): array
    {
        return [
            'locations' => $business->locations()->latest()->get()->map(fn (Location $location): array => [
                'id' => $location->public_id,
                'name' => $location->name,
                'email' => $location->email,
                'phone' => $location->phone,
                'address' => collect([$location->address_line_1, $location->address_line_2, $location->city, $location->province])->filter()->join(', '),
                'addressLine1' => $location->address_line_1,
                'city' => $location->city,
                'province' => $location->province,
                'postalCode' => $location->postal_code,
                'timezone' => $location->timezone,
                'openingHours' => $location->opening_hours,
                'isActive' => $location->is_active,
            ])->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function analyticsData(Business $business): array
    {
        $appointments = $business->appointments()->with(['service:id,name', 'staffProfile:id,display_name'])->get();
        $total = $appointments->count();
        $completed = $appointments->where('status', AppointmentStatus::Completed)->count();

        return [
            'metrics' => [
                'totalAppointments' => $total,
                'completionRate' => $total ? round(($completed / $total) * 100) : 0,
                'revenueMinor' => (int) $appointments->where('status', AppointmentStatus::Completed)->sum('price_minor'),
                'newCustomers' => $business->customerProfiles()->where('created_at', '>=', now()->subMonth())->count(),
                'cancelled' => $appointments->whereIn('status', [AppointmentStatus::Cancelled, AppointmentStatus::NoShow])->count(),
            ],
            'popularServices' => $appointments->groupBy('service.name')->map(fn (Collection $rows, string $name): array => ['name' => $name, 'bookings' => $rows->count()])->sortByDesc('bookings')->take(5)->values()->all(),
            'staffUtilization' => $appointments->groupBy('staffProfile.display_name')->map(fn (Collection $rows, string $name): array => ['name' => $name, 'appointments' => $rows->count()])->sortByDesc('appointments')->take(5)->values()->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function notificationData(Business $business): array
    {
        return [
            'notifications' => NotificationDelivery::query()
                ->whereHas('appointment', fn ($query) => $query->where('business_id', $business->getKey()))
                ->with(['user:id,name', 'appointment:id,public_id,reference'])
                ->latest()
                ->limit(100)
                ->get()
                ->map(fn (NotificationDelivery $delivery): array => [
                    'id' => $delivery->public_id,
                    'title' => str($delivery->template)->replace('_', ' ')->title()->toString(),
                    'message' => $delivery->user?->name.' · '.$delivery->channel.' · '.$delivery->appointment?->reference,
                    'status' => str($delivery->status)->title()->toString(),
                    'sentAt' => CarbonImmutable::parse($delivery->sent_at ?? $delivery->created_at)->toIso8601String(),
                ])->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function archivedData(Business $business): array
    {
        $rows = collect()
            ->concat(Service::onlyTrashed()->where('business_id', $business->getKey())->get()->map(fn (Service $service): array => [
                'id' => $service->public_id,
                'type' => 'Service',
                'name' => $service->name,
                'archivedAt' => $service->deleted_at?->toIso8601String(),
            ]))
            ->concat(StaffProfile::onlyTrashed()->where('business_id', $business->getKey())->get()->map(fn (StaffProfile $staff): array => [
                'id' => $staff->public_id,
                'type' => 'Staff',
                'name' => $staff->display_name,
                'archivedAt' => $staff->deleted_at?->toIso8601String(),
            ]))
            ->concat(Location::onlyTrashed()->where('business_id', $business->getKey())->get()->map(fn (Location $location): array => [
                'id' => $location->public_id,
                'type' => 'Location',
                'name' => $location->name,
                'archivedAt' => $location->deleted_at?->toIso8601String(),
            ]))
            ->concat(BusinessCustomer::onlyTrashed()->where('business_id', $business->getKey())->with('user:id,name')->get()->map(fn (BusinessCustomer $customer): array => [
                'id' => $customer->public_id,
                'type' => 'Customer',
                'name' => $customer->user->name,
                'archivedAt' => $customer->deleted_at?->toIso8601String(),
            ]));

        return ['records' => $rows->sortByDesc('archivedAt')->values()->all()];
    }

    /** @return array<string, mixed> */
    private function settingsData(Business $business): array
    {
        return ['settings' => [
            'confirmationMode' => $business->confirmation_mode,
            'slotIntervalMinutes' => $business->slot_interval_minutes,
            'bookingHorizonDays' => $business->booking_horizon_days,
            'minimumNoticeMinutes' => $business->minimum_notice_minutes,
            'cancellationNoticeMinutes' => $business->cancellation_notice_minutes,
            'reminderMinutes' => $business->reminder_minutes ?? [1440, 120],
        ]];
    }

    /** @return array<string, mixed> */
    private function appointmentRow(Appointment $appointment): array
    {
        return [
            'id' => $appointment->public_id,
            'reference' => $appointment->reference,
            'customer' => $appointment->customer->name,
            'customerId' => $appointment->businessCustomer->public_id,
            'service' => $appointment->service->name,
            'serviceId' => $appointment->service->public_id,
            'staff' => $appointment->staffProfile->display_name,
            'staffId' => $appointment->staffProfile->public_id,
            'location' => $appointment->location->name,
            'locationId' => $appointment->location->public_id,
            'status' => $appointment->status->value,
            'paymentStatus' => $appointment->payment_status->value,
            'startsAt' => $appointment->starts_at->toIso8601String(),
            'endsAt' => $appointment->ends_at->toIso8601String(),
            'durationMinutes' => $appointment->starts_at->diffInMinutes($appointment->ends_at),
            'priceMinor' => $appointment->price_minor,
            'notes' => $appointment->internal_notes,
        ];
    }

    private function initials(string $name): string
    {
        $parts = array_slice(array_values(array_filter(explode(' ', trim($name)))), 0, 2);

        return mb_strtoupper(implode('', array_map(fn (string $part): string => mb_substr($part, 0, 1), $parts)));
    }
}
