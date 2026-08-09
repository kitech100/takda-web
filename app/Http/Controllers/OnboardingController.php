<?php

namespace App\Http\Controllers;

use App\Enums\BusinessStatus;
use App\Enums\MembershipRole;
use App\Models\Business;
use App\Models\BusinessApplication;
use App\Models\Location;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function details(Request $request): Response|RedirectResponse
    {
        if ($request->user()->memberships()->where('status', 'active')->exists()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('onboarding/details', [
            'draft' => $request->session()->get('onboarding.details', [
                'name' => '',
                'description' => '',
                'email' => $request->user()->email,
                'phone' => $request->user()->phone,
                'category' => 'Massage & Wellness',
            ]),
        ]);
    }

    public function storeDetails(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'category' => ['required', 'string', 'max:80'],
        ]);

        $request->session()->put('onboarding.details', $validated);

        return redirect()->route('onboarding.location');
    }

    public function location(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('onboarding.details')) {
            return redirect()->route('onboarding.details');
        }

        return Inertia::render('onboarding/location', [
            'draft' => $request->session()->get('onboarding.location', [
                'name' => 'Main Branch',
                'address_line_1' => '',
                'city' => '',
                'province' => '',
                'postal_code' => '',
                'phone' => '',
                'timezone' => 'Asia/Manila',
                'opening_hours' => $this->defaultHours(),
            ]),
        ]);
    }

    public function storeLocation(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'province' => ['nullable', 'string', 'max:120'],
            'postal_code' => ['nullable', 'string', 'max:16'],
            'phone' => ['required', 'string', 'max:32'],
            'timezone' => ['required', 'timezone:all'],
            'opening_hours' => ['required', 'array', 'size:7'],
            'opening_hours.*.day' => ['required', 'integer', 'between:0,6'],
            'opening_hours.*.enabled' => ['required', 'boolean'],
            'opening_hours.*.opens' => ['nullable', 'date_format:H:i'],
            'opening_hours.*.closes' => ['nullable', 'date_format:H:i'],
        ]);

        $request->session()->put('onboarding.location', $validated);

        return redirect()->route('onboarding.review');
    }

    public function review(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('onboarding.details')) {
            return redirect()->route('onboarding.details');
        }

        if (! $request->session()->has('onboarding.location')) {
            return redirect()->route('onboarding.location');
        }

        return Inertia::render('onboarding/review', [
            'details' => $request->session()->get('onboarding.details'),
            'location' => $request->session()->get('onboarding.location'),
        ]);
    }

    public function submit(Request $request): RedirectResponse
    {
        $details = $request->session()->get('onboarding.details');
        $locationData = $request->session()->get('onboarding.location');

        abort_unless(is_array($details) && is_array($locationData), 422, 'Complete all onboarding steps first.');

        DB::transaction(function () use ($request, $details, $locationData): void {
            $business = Business::create([
                'name' => $details['name'],
                'slug' => $this->uniqueBusinessSlug($details['name']),
                'description' => $details['description'] ?: null,
                'email' => $details['email'],
                'phone' => $details['phone'],
                'timezone' => $locationData['timezone'],
                'status' => BusinessStatus::PendingApproval,
                'reminder_minutes' => [1440, 120],
            ]);

            $business->memberships()->create([
                'user_id' => $request->user()->getKey(),
                'role' => MembershipRole::Owner,
                'status' => 'active',
                'joined_at' => now(),
            ]);

            Location::create([
                'business_id' => $business->getKey(),
                'name' => $locationData['name'],
                'slug' => Str::slug($locationData['name']) ?: 'main-branch',
                'phone' => $locationData['phone'],
                'address_line_1' => $locationData['address_line_1'],
                'city' => $locationData['city'],
                'province' => $locationData['province'] ?: null,
                'postal_code' => $locationData['postal_code'] ?: null,
                'timezone' => $locationData['timezone'],
                'opening_hours' => $locationData['opening_hours'],
            ]);

            BusinessApplication::create([
                'owner_id' => $request->user()->getKey(),
                'business_id' => $business->getKey(),
                'status' => 'pending',
                'submitted_data' => ['details' => $details, 'location' => $locationData],
                'submitted_at' => now(),
            ]);
        });

        $request->session()->forget(['onboarding.details', 'onboarding.location']);

        return redirect()->route('dashboard')->with('success', 'Your business application was submitted for review.');
    }

    /** @return list<array{day: int, enabled: bool, opens: string|null, closes: string|null}> */
    private function defaultHours(): array
    {
        return array_values(collect(range(0, 6))->map(fn (int $day): array => [
            'day' => $day,
            'enabled' => $day !== 6,
            'opens' => $day === 6 ? null : ($day === 5 ? '10:00' : '09:00'),
            'closes' => $day === 6 ? null : ($day === 5 ? '18:00' : '20:00'),
        ])->all());
    }

    private function uniqueBusinessSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'business';
        $slug = $base;
        $suffix = 2;

        while (Business::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }
}
