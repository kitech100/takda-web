<?php

namespace Tests\Feature;

use App\Enums\BusinessStatus;
use App\Enums\MembershipRole;
use App\Models\Appointment;
use App\Models\Business;
use App\Models\BusinessCustomer;
use App\Models\Location;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\StaffProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BusinessOwnerWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_and_manage_an_appointment(): void
    {
        [$owner, $business, $location, $service, $staff, $customer] = $this->fixtures();

        $this->actingAs($owner)->post(route('business.appointments.store'), [
            'customer_id' => $customer->public_id,
            'location_id' => $location->public_id,
            'service_id' => $service->public_id,
            'staff_id' => $staff->public_id,
            'starts_at' => now()->addDay()->toIso8601String(),
            'notes' => 'First visit',
        ])->assertRedirect();

        $appointment = Appointment::firstOrFail();
        $this->assertSame($business->getKey(), $appointment->business_id);

        $this->actingAs($owner)->patch(route('business.appointments.status', $appointment), [
            'status' => 'completed',
        ])->assertRedirect();

        $this->assertDatabaseHas('appointments', ['id' => $appointment->getKey(), 'status' => 'completed']);
        $this->assertDatabaseHas('business_customers', ['id' => $customer->getKey(), 'completed_visits' => 1]);
    }

    public function test_owner_can_archive_and_restore_a_service(): void
    {
        [$owner, , , $service] = $this->fixtures();

        $this->actingAs($owner)->delete(route('business.archive', ['type' => 'service', 'id' => $service->public_id]))->assertRedirect();
        $this->assertSoftDeleted($service);

        $this->actingAs($owner)->patch(route('business.restore', ['type' => 'service', 'id' => $service->public_id]))->assertRedirect();
        $this->assertNotSoftDeleted($service->fresh());
    }

    /** @return array{User, Business, Location, Service, StaffProfile, BusinessCustomer} */
    private function fixtures(): array
    {
        $owner = User::factory()->create();
        $business = Business::create(['name' => 'Owner Studio', 'slug' => 'owner-studio', 'status' => BusinessStatus::Active]);
        $business->memberships()->create(['user_id' => $owner->getKey(), 'role' => MembershipRole::Owner, 'status' => 'active', 'joined_at' => now()]);
        $location = Location::create(['business_id' => $business->getKey(), 'name' => 'Main', 'slug' => 'main', 'address_line_1' => 'One Street', 'city' => 'Makati', 'timezone' => 'Asia/Manila']);
        $category = ServiceCategory::create(['business_id' => $business->getKey(), 'name' => 'Massage', 'slug' => 'massage']);
        $service = Service::create(['business_id' => $business->getKey(), 'service_category_id' => $category->getKey(), 'name' => 'Swedish', 'slug' => 'swedish', 'price_minor' => 100000, 'duration_minutes' => 60]);
        $staff = StaffProfile::create(['business_id' => $business->getKey(), 'display_name' => 'Maria']);
        $staff->locations()->attach($location);
        $staff->services()->attach($service);
        $customerUser = User::factory()->create();
        $customer = BusinessCustomer::create(['business_id' => $business->getKey(), 'user_id' => $customerUser->getKey()]);

        return [$owner, $business, $location, $service, $staff, $customer];
    }
}
