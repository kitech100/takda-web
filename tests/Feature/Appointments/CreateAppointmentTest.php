<?php

namespace Tests\Feature\Appointments;

use App\Actions\Appointments\CreateAppointment;
use App\Enums\AppointmentStatus;
use App\Enums\BusinessStatus;
use App\Exceptions\AppointmentConflictException;
use App\Models\Business;
use App\Models\Location;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\StaffProfile;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateAppointmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_appointment_is_created_with_a_price_and_time_snapshot(): void
    {
        [$business, $location, $service, $staff] = $this->bookingFixtures();
        $customer = User::factory()->create();

        $appointment = app(CreateAppointment::class)->execute(
            customer: $customer,
            business: $business,
            location: $location,
            service: $service,
            staffProfile: $staff,
            startsAt: CarbonImmutable::parse('2026-08-10 02:00:00', 'UTC'),
        );

        $this->assertSame(AppointmentStatus::Confirmed, $appointment->status);
        $this->assertSame(65000, $appointment->price_minor);
        $this->assertEquals(60, $appointment->starts_at->diffInMinutes($appointment->ends_at));
        $this->assertDatabaseHas('appointment_events', [
            'appointment_id' => $appointment->getKey(),
            'event_type' => 'appointment.created',
        ]);
    }

    public function test_the_same_staff_time_cannot_be_booked_twice(): void
    {
        [$business, $location, $service, $staff] = $this->bookingFixtures();
        $startsAt = CarbonImmutable::parse('2026-08-10 02:00:00', 'UTC');

        app(CreateAppointment::class)->execute(
            User::factory()->create(),
            $business,
            $location,
            $service,
            $staff,
            $startsAt,
        );

        $this->expectException(AppointmentConflictException::class);

        app(CreateAppointment::class)->execute(
            User::factory()->create(),
            $business,
            $location,
            $service,
            $staff,
            $startsAt,
        );
    }

    /** @return array{Business, Location, Service, StaffProfile} */
    private function bookingFixtures(): array
    {
        $business = Business::create([
            'name' => 'Makati Wellness Studio',
            'slug' => 'makati-wellness-studio',
            'status' => BusinessStatus::Active,
            'confirmation_mode' => 'automatic',
        ]);

        $location = Location::create([
            'business_id' => $business->getKey(),
            'name' => 'Makati',
            'slug' => 'makati',
            'address_line_1' => 'Ayala Avenue',
            'city' => 'Makati City',
            'timezone' => 'Asia/Manila',
        ]);

        $category = ServiceCategory::create([
            'business_id' => $business->getKey(),
            'name' => 'Consultations',
            'slug' => 'consultations',
        ]);

        $service = Service::create([
            'business_id' => $business->getKey(),
            'service_category_id' => $category->getKey(),
            'name' => 'Initial consultation',
            'slug' => 'initial-consultation',
            'price_minor' => 65000,
            'duration_minutes' => 60,
            'buffer_before_minutes' => 5,
            'buffer_after_minutes' => 10,
        ]);

        $staff = StaffProfile::create([
            'business_id' => $business->getKey(),
            'display_name' => 'Alex Santos',
        ]);

        $staff->locations()->attach($location);
        $staff->services()->attach($service);

        return [$business, $location, $service, $staff];
    }
}
