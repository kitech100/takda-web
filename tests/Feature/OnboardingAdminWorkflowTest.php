<?php

namespace Tests\Feature;

use App\Models\BusinessApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OnboardingAdminWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_submit_and_admin_can_approve_an_application(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $hours = collect(range(0, 6))->map(fn (int $day): array => ['day' => $day, 'enabled' => $day !== 6, 'opens' => $day === 6 ? null : '09:00', 'closes' => $day === 6 ? null : '18:00'])->all();

        $this->actingAs($owner)->post(route('onboarding.details.store'), [
            'name' => 'New Wellness Co', 'description' => 'Wellness services', 'email' => 'hello@new.test', 'phone' => '09170000000', 'category' => 'Spa',
        ])->assertRedirect(route('onboarding.location'));

        $this->actingAs($owner)->post(route('onboarding.location.store'), [
            'name' => 'Main Branch', 'address_line_1' => 'One Ayala', 'city' => 'Makati', 'province' => 'Metro Manila', 'postal_code' => '1200', 'phone' => '09170000000', 'timezone' => 'Asia/Manila', 'opening_hours' => $hours,
        ])->assertRedirect(route('onboarding.review'));

        $this->actingAs($owner)->post(route('onboarding.submit'))->assertRedirect(route('dashboard'));
        $application = BusinessApplication::with('business')->firstOrFail();
        $this->assertSame('pending', $application->status);

        $role = Role::create(['name' => 'platform-admin', 'guard_name' => 'web']);
        $admin = User::factory()->create(['email_verified_at' => now()]);
        $admin->assignRole($role);

        $this->actingAs($admin)->patch(route('admin.applications.decide', $application), [
            'decision' => 'approved', 'review_notes' => 'Verified',
        ])->assertRedirect(route('admin.applications'));

        $this->assertSame('approved', $application->fresh()->status);
        $this->assertSame('active', $application->business->fresh()->status->value);
    }

    public function test_business_owner_cannot_access_platform_admin(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $this->actingAs($owner)->get(route('admin.dashboard'))->assertForbidden();
    }
}
