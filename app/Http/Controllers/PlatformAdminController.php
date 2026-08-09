<?php

namespace App\Http\Controllers;

use App\Enums\BusinessStatus;
use App\Models\Appointment;
use App\Models\Business;
use App\Models\BusinessApplication;
use App\Models\BusinessCustomer;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PlatformAdminController extends Controller
{
    public function dashboard(): Response
    {
        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'pendingApplications' => BusinessApplication::whereIn('status', ['pending', 'under_review'])->count(),
                'approvedBusinesses' => Business::where('status', BusinessStatus::Active)->count(),
                'activeCustomers' => BusinessCustomer::count(),
                'monthlyBookings' => Appointment::where('created_at', '>=', now()->startOfMonth())->count(),
            ],
            'applications' => $this->applicationQuery()->limit(8)->get()->map(fn (BusinessApplication $application): array => $this->applicationRow($application))->all(),
            'businessHealth' => [
                'approved' => BusinessApplication::where('status', 'approved')->count(),
                'pending' => BusinessApplication::whereIn('status', ['pending', 'under_review'])->count(),
                'needsChanges' => BusinessApplication::where('status', 'needs_changes')->count(),
            ],
        ]);
    }

    public function applications(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $search = $request->string('search')->toString();

        $applications = $this->applicationQuery()
            ->when($status && $status !== 'all', fn ($query) => $query->where('status', $status))
            ->when($search, fn ($query) => $query->whereHas('business', fn ($business) => $business->where('name', 'like', '%'.$search.'%')))
            ->paginate(20)
            ->withQueryString()
            ->through(fn (BusinessApplication $application): array => $this->applicationRow($application));

        return Inertia::render('admin/applications', [
            'applications' => $applications,
            'filters' => ['status' => $status ?: 'all', 'search' => $search],
        ]);
    }

    public function review(BusinessApplication $application): Response
    {
        if ($application->status === 'pending') {
            $application->update(['status' => 'under_review']);
        }

        $application->load(['owner:id,public_id,name,email,phone', 'business.locations']);

        return Inertia::render('admin/review', [
            'application' => [
                ...$this->applicationRow($application),
                'id' => $application->public_id,
                'email' => $application->owner->email,
                'phone' => $application->owner->phone,
                'description' => $application->business->description,
                'registrationNumber' => $application->submitted_data['details']['registration_number'] ?? null,
                'location' => $application->business->locations->first() ? [
                    'address' => collect([
                        $application->business->locations->first()->address_line_1,
                        $application->business->locations->first()->city,
                        $application->business->locations->first()->province,
                    ])->filter()->join(', '),
                    'phone' => $application->business->locations->first()->phone,
                    'timezone' => $application->business->locations->first()->timezone,
                ] : null,
                'reviewNotes' => $application->review_notes,
                'submittedData' => $application->submitted_data,
            ],
        ]);
    }

    public function decide(Request $request, BusinessApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'decision' => ['required', Rule::in(['approved', 'needs_changes', 'rejected'])],
            'review_notes' => ['nullable', 'string', 'max:4000', Rule::requiredIf($request->input('decision') !== 'approved')],
        ]);

        $decision = (string) $validated['decision'];
        $application->update([
            'status' => $decision,
            'review_notes' => $validated['review_notes'] ?? null,
            'reviewed_by' => $request->user()->getKey(),
            'reviewed_at' => now(),
        ]);

        $application->business->update(match ($decision) {
            'approved' => [
                'status' => BusinessStatus::Active,
                'approved_by' => $request->user()->getKey(),
                'approved_at' => now(),
                'published_at' => now(),
            ],
            'needs_changes' => ['status' => BusinessStatus::Draft],
            'rejected' => ['status' => BusinessStatus::Suspended],
            default => abort(422),
        });

        return redirect()->route('admin.applications')->with('success', 'Application decision saved.');
    }

    public function businesses(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $businesses = Business::query()
            ->with(['memberships' => fn ($query) => $query->where('role', 'owner')->with('user:id,name,email')])
            ->withCount(['appointments', 'locations', 'staffProfiles'])
            ->when($search, fn ($query) => $query->where('name', 'like', '%'.$search.'%'))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Business $business): array => [
                'id' => $business->public_id,
                'name' => $business->name,
                'owner' => $business->memberships->first()?->user?->name,
                'email' => $business->memberships->first()?->user?->email,
                'status' => $business->status->value,
                'locations' => $business->locations_count,
                'staff' => $business->staff_profiles_count,
                'appointments' => $business->appointments_count,
                'createdAt' => $business->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/businesses', ['businesses' => $businesses, 'filters' => ['search' => $search]]);
    }

    public function updateBusinessStatus(Request $request, Business $business): RedirectResponse
    {
        $validated = $request->validate(['status' => ['required', Rule::enum(BusinessStatus::class)]]);
        $business->update(['status' => $validated['status']]);

        return back()->with('success', 'Business status updated.');
    }

    public function settings(): Response
    {
        return Inertia::render('admin/settings', [
            'system' => [
                'appName' => config('app.name'),
                'environment' => app()->environment(),
                'queue' => config('queue.default'),
                'cache' => config('cache.default'),
                'mail' => config('mail.default'),
                'users' => User::count(),
            ],
        ]);
    }

    /** @return Builder<BusinessApplication> */
    private function applicationQuery(): Builder
    {
        return BusinessApplication::query()->with(['business:id,public_id,name,status', 'owner:id,public_id,name,email'])->latest('submitted_at');
    }

    /** @return array<string, mixed> */
    private function applicationRow(BusinessApplication $application): array
    {
        return [
            'id' => $application->public_id,
            'business' => $application->business->name ?? ($application->submitted_data['details']['name'] ?? 'Untitled business'),
            'category' => $application->submitted_data['details']['category'] ?? 'Other',
            'owner' => $application->owner->name,
            'ownerEmail' => $application->owner->email,
            'submittedAt' => $application->submitted_at?->toIso8601String(),
            'status' => $application->status,
        ];
    }
}
