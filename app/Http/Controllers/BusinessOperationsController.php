<?php

namespace App\Http\Controllers;

use App\Actions\Appointments\CreateAppointment;
use App\Enums\AppointmentStatus;
use App\Enums\MembershipRole;
use App\Exceptions\AppointmentConflictException;
use App\Models\Appointment;
use App\Models\Business;
use App\Models\BusinessCustomer;
use App\Models\Location;
use App\Models\NotificationDelivery;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\StaffProfile;
use App\Models\User;
use App\Support\CurrentBusiness;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BusinessOperationsController extends Controller
{
    public function __construct(private readonly CurrentBusiness $currentBusiness) {}

    public function storeAppointment(Request $request, CreateAppointment $createAppointment): RedirectResponse
    {
        $business = $this->business($request);
        $validated = $request->validate([
            'customer_id' => ['required', 'uuid'],
            'location_id' => ['required', 'uuid'],
            'service_id' => ['required', 'uuid'],
            'staff_id' => ['required', 'uuid'],
            'starts_at' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $customer = $this->owned(BusinessCustomer::class, $business, $validated['customer_id']);
        $location = $this->owned(Location::class, $business, $validated['location_id']);
        $service = $this->owned(Service::class, $business, $validated['service_id']);
        $staff = $this->owned(StaffProfile::class, $business, $validated['staff_id']);

        try {
            $appointment = $createAppointment->execute(
                customer: $customer->user,
                business: $business,
                location: $location,
                service: $service,
                staffProfile: $staff,
                startsAt: CarbonImmutable::parse($validated['starts_at'], $location->timezone),
                customerNotes: $validated['notes'] ?? null,
                source: 'web',
            );
        } catch (AppointmentConflictException) {
            throw ValidationException::withMessages(['starts_at' => 'This staff member already has an appointment during that time.']);
        }

        NotificationDelivery::create([
            'user_id' => $customer->user_id,
            'appointment_id' => $appointment->getKey(),
            'channel' => 'email',
            'template' => 'appointment_created',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return back()->with('success', 'Appointment created successfully.');
    }

    public function updateAppointmentStatus(Request $request, Appointment $appointment): RedirectResponse
    {
        $business = $this->business($request);
        $this->assertOwned($appointment, $business);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(AppointmentStatus::class)],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $previous = $appointment->status;
        $status = AppointmentStatus::from($validated['status']);
        $appointment->status = $status;

        if ($status === AppointmentStatus::Cancelled) {
            $appointment->cancellation_reason = $validated['reason'] ?? null;
            $appointment->cancelled_by = $request->user()->getKey();
            $appointment->cancelled_at = now();
        }

        $appointment->save();
        $appointment->events()->create([
            'actor_user_id' => $request->user()->getKey(),
            'event_type' => 'appointment.status_changed',
            'properties' => ['from' => $previous->value, 'to' => $status->value],
        ]);

        $this->refreshCustomerStats($appointment->businessCustomer);

        NotificationDelivery::create([
            'user_id' => $appointment->customer_user_id,
            'appointment_id' => $appointment->getKey(),
            'channel' => 'email',
            'template' => 'appointment_'.$status->value,
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return back()->with('success', 'Appointment status updated.');
    }

    public function destroyAppointment(Request $request, Appointment $appointment): RedirectResponse
    {
        $business = $this->business($request);
        $this->assertOwned($appointment, $business);
        $appointment->delete();

        return back()->with('success', 'Appointment archived.');
    }

    public function storeCustomer(Request $request): RedirectResponse
    {
        $business = $this->business($request);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($business, $validated): void {
            $user = User::withTrashed()->firstOrCreate(
                ['email' => Str::lower($validated['email'])],
                ['name' => $validated['name'], 'phone' => $validated['phone'], 'password' => Hash::make(Str::random(40))],
            );
            if ($user->trashed()) {
                $user->restore();
            }
            $user->update(['name' => $validated['name'], 'phone' => $validated['phone']]);

            $customer = BusinessCustomer::withTrashed()->firstOrCreate(
                ['business_id' => $business->getKey(), 'user_id' => $user->getKey()],
                ['internal_notes' => $validated['notes'] ?? null],
            );
            if ($customer->trashed()) {
                $customer->restore();
            }
            $customer->update(['internal_notes' => $validated['notes'] ?? null]);
        });

        return back()->with('success', 'Customer added.');
    }

    public function updateCustomer(Request $request, BusinessCustomer $customer): RedirectResponse
    {
        $business = $this->business($request);
        $this->assertOwned($customer, $business);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:32'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $customer->user->update(['name' => $validated['name'], 'phone' => $validated['phone']]);
        $customer->update(['internal_notes' => $validated['notes'] ?? null]);

        return back()->with('success', 'Customer updated.');
    }

    public function storeService(Request $request): RedirectResponse
    {
        $business = $this->business($request);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'category_id' => ['nullable', 'uuid'],
            'category_name' => ['nullable', 'string', 'max:120'],
            'price_minor' => ['required', 'integer', 'min:0'],
            'duration_minutes' => ['required', 'integer', 'between:5,1440'],
            'buffer_minutes' => ['required', 'integer', 'between:0,240'],
        ]);

        $category = $this->resolveCategory($business, $validated);
        Service::create([
            'business_id' => $business->getKey(),
            'service_category_id' => $category?->getKey(),
            'name' => $validated['name'],
            'slug' => $this->uniqueSlug(Service::class, $business, $validated['name']),
            'description' => $validated['description'] ?? null,
            'price_minor' => $validated['price_minor'],
            'currency' => $business->currency,
            'duration_minutes' => $validated['duration_minutes'],
            'buffer_after_minutes' => $validated['buffer_minutes'],
        ]);

        return back()->with('success', 'Service created.');
    }

    public function updateService(Request $request, Service $service): RedirectResponse
    {
        $business = $this->business($request);
        $this->assertOwned($service, $business);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'category_id' => ['nullable', 'uuid'],
            'price_minor' => ['required', 'integer', 'min:0'],
            'duration_minutes' => ['required', 'integer', 'between:5,1440'],
            'buffer_minutes' => ['required', 'integer', 'between:0,240'],
            'is_visible' => ['required', 'boolean'],
        ]);
        $category = isset($validated['category_id']) ? $this->owned(ServiceCategory::class, $business, $validated['category_id']) : null;
        $service->update([
            'service_category_id' => $category?->getKey(),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price_minor' => $validated['price_minor'],
            'duration_minutes' => $validated['duration_minutes'],
            'buffer_after_minutes' => $validated['buffer_minutes'],
            'is_visible' => $validated['is_visible'],
        ]);

        return back()->with('success', 'Service updated.');
    }

    public function storeStaff(Request $request): RedirectResponse
    {
        $business = $this->business($request);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'title' => ['nullable', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
            'service_ids' => ['required', 'array', 'min:1'],
            'service_ids.*' => ['uuid'],
            'location_ids' => ['required', 'array', 'min:1'],
            'location_ids.*' => ['uuid'],
        ]);

        DB::transaction(function () use ($request, $business, $validated): void {
            $user = null;
            if (! empty($validated['email'])) {
                $user = User::firstOrCreate(
                    ['email' => Str::lower($validated['email'])],
                    ['name' => $validated['name'], 'phone' => $validated['phone'] ?? null, 'password' => Hash::make(Str::random(40))],
                );
                $user->update(['name' => $validated['name'], 'phone' => $validated['phone'] ?? null]);
                $membership = $business->memberships()->withTrashed()->firstOrNew(['user_id' => $user->getKey()]);
                $membership->fill([
                    'role' => MembershipRole::Staff,
                    'status' => 'active',
                    'invited_by' => $request->user()->getKey(),
                    'joined_at' => now(),
                ]);
                $membership->save();
                if ($membership->trashed()) {
                    $membership->restore();
                }
            }

            $staff = StaffProfile::create([
                'business_id' => $business->getKey(),
                'user_id' => $user?->getKey(),
                'display_name' => $validated['name'],
                'title' => $validated['title'] ?? null,
            ]);
            $staff->services()->sync($this->idsFor(Service::class, $business, $validated['service_ids']));
            $staff->locations()->sync($this->idsFor(Location::class, $business, $validated['location_ids']));
        });

        return back()->with('success', 'Staff member added.');
    }

    public function updateStaff(Request $request, StaffProfile $staff): RedirectResponse
    {
        $business = $this->business($request);
        $this->assertOwned($staff, $business);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'title' => ['nullable', 'string', 'max:120'],
            'is_bookable' => ['required', 'boolean'],
            'service_ids' => ['required', 'array', 'min:1'],
            'service_ids.*' => ['uuid'],
            'location_ids' => ['required', 'array', 'min:1'],
            'location_ids.*' => ['uuid'],
        ]);
        $staff->update(['display_name' => $validated['name'], 'title' => $validated['title'] ?? null, 'is_bookable' => $validated['is_bookable']]);
        $staff->services()->sync($this->idsFor(Service::class, $business, $validated['service_ids']));
        $staff->locations()->sync($this->idsFor(Location::class, $business, $validated['location_ids']));

        return back()->with('success', 'Staff member updated.');
    }

    public function storeLocation(Request $request): RedirectResponse
    {
        $business = $this->business($request);
        $validated = $this->validateLocation($request);
        Location::create([
            ...$validated,
            'business_id' => $business->getKey(),
            'slug' => $this->uniqueSlug(Location::class, $business, $validated['name']),
        ]);

        return back()->with('success', 'Location created.');
    }

    public function updateLocation(Request $request, Location $location): RedirectResponse
    {
        $business = $this->business($request);
        $this->assertOwned($location, $business);
        $location->update($this->validateLocation($request));

        return back()->with('success', 'Location updated.');
    }

    public function updateBookingRules(Request $request): RedirectResponse
    {
        $business = $this->business($request);
        $validated = $request->validate([
            'confirmation_mode' => ['required', Rule::in(['automatic', 'manual'])],
            'slot_interval_minutes' => ['required', Rule::in([5, 10, 15, 20, 30, 60])],
            'booking_horizon_days' => ['required', 'integer', 'between:1,365'],
            'minimum_notice_minutes' => ['required', 'integer', 'between:0,10080'],
            'cancellation_notice_minutes' => ['required', 'integer', 'between:0,43200'],
            'reminder_minutes' => ['required', 'array', 'min:1', 'max:5'],
            'reminder_minutes.*' => ['integer', 'between:5,43200'],
        ]);
        $business->update($validated);

        return back()->with('success', 'Booking rules saved.');
    }

    public function archive(Request $request, string $type, string $id): RedirectResponse
    {
        $business = $this->business($request);
        $model = $this->resource($type, $business, $id);
        $model->delete();

        return back()->with('success', str($type)->title().' archived.');
    }

    public function restore(Request $request, string $type, string $id): RedirectResponse
    {
        $business = $this->business($request);
        $model = match ($type) {
            'service' => Service::onlyTrashed()->where('business_id', $business->getKey())->where('public_id', $id)->firstOrFail(),
            'staff' => StaffProfile::onlyTrashed()->where('business_id', $business->getKey())->where('public_id', $id)->firstOrFail(),
            'location' => Location::onlyTrashed()->where('business_id', $business->getKey())->where('public_id', $id)->firstOrFail(),
            'customer' => BusinessCustomer::onlyTrashed()->where('business_id', $business->getKey())->where('public_id', $id)->firstOrFail(),
            default => abort(404),
        };
        $model->restore();

        return back()->with('success', str($type)->title().' restored.');
    }

    private function business(Request $request): Business
    {
        return $this->currentBusiness->forOrFail($request->user());
    }

    /**
     * @template TModel of Model
     *
     * @param  class-string<TModel>  $class
     * @return TModel
     */
    private function owned(string $class, Business $business, string $publicId): Model
    {
        /** @var TModel $model */
        $model = $class::query()->where('business_id', $business->getKey())->where('public_id', $publicId)->firstOrFail();

        return $model;
    }

    private function assertOwned(Model $model, Business $business): void
    {
        abort_unless((int) $model->getAttribute('business_id') === (int) $business->getKey(), 404);
    }

    /**
     * @param  class-string<Model>  $class
     * @param  list<string>  $publicIds
     * @return list<int>
     */
    private function idsFor(string $class, Business $business, array $publicIds): array
    {
        return array_map(
            fn (string $publicId): int => (int) $this->owned($class, $business, $publicId)->getKey(),
            $publicIds,
        );
    }

    /** @param array<string, mixed> $validated */
    private function resolveCategory(Business $business, array $validated): ?ServiceCategory
    {
        if (! empty($validated['category_id'])) {
            return $this->owned(ServiceCategory::class, $business, $validated['category_id']);
        }

        if (! empty($validated['category_name'])) {
            return ServiceCategory::firstOrCreate(
                ['business_id' => $business->getKey(), 'slug' => $this->uniqueSlug(ServiceCategory::class, $business, $validated['category_name'])],
                ['name' => $validated['category_name']],
            );
        }

        return null;
    }

    /** @param class-string<Model> $class */
    private function uniqueSlug(string $class, Business $business, string $name): string
    {
        $base = Str::slug($name) ?: 'record';
        $slug = $base;
        $suffix = 2;
        $table = (new $class)->getTable();
        while (DB::table($table)->where('business_id', $business->getKey())->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }

    /** @return array<string, mixed> */
    private function validateLocation(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'province' => ['nullable', 'string', 'max:120'],
            'postal_code' => ['nullable', 'string', 'max:16'],
            'timezone' => ['required', 'timezone:all'],
            'opening_hours' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function refreshCustomerStats(BusinessCustomer $customer): void
    {
        $completed = $customer->appointments()->where('status', AppointmentStatus::Completed)->count();
        $last = $customer->appointments()->where('status', AppointmentStatus::Completed)->max('starts_at');
        $customer->update(['completed_visits' => $completed, 'last_visited_at' => $last]);
    }

    private function resource(string $type, Business $business, string $id): Model
    {
        return $this->owned($this->resourceClass($type), $business, $id);
    }

    /** @return class-string<Model> */
    private function resourceClass(string $type): string
    {
        return match ($type) {
            'service' => Service::class,
            'staff' => StaffProfile::class,
            'location' => Location::class,
            'customer' => BusinessCustomer::class,
            default => abort(404),
        };
    }
}
