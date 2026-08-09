<?php

namespace Tests\Feature;

use App\Enums\BusinessStatus;
use App\Enums\MembershipRole;
use App\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_users_without_a_business_are_sent_to_onboarding()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('onboarding.details'));
    }

    public function test_business_members_can_visit_the_dashboard(): void
    {
        $user = User::factory()->create();
        $business = Business::create(['name' => 'Test Studio', 'slug' => 'test-studio', 'status' => BusinessStatus::Active]);
        $business->memberships()->create(['user_id' => $user->getKey(), 'role' => MembershipRole::Owner, 'status' => 'active', 'joined_at' => now()]);

        $this->actingAs($user)->get(route('dashboard'))->assertOk();
    }
}
