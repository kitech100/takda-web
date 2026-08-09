<?php

namespace App\Http\Middleware;

use App\Models\BusinessApplication;
use App\Models\NotificationDelivery;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'workspace' => fn (): ?array => $this->workspace($request),
            'platform' => fn (): ?array => $this->platform($request),
            'flash' => [
                'toast' => fn (): ?array => match (true) {
                    $request->session()->has('success') => ['type' => 'success', 'message' => $request->session()->get('success')],
                    $request->session()->has('error') => ['type' => 'error', 'message' => $request->session()->get('error')],
                    default => null,
                },
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /** @return array<string, mixed>|null */
    private function workspace(Request $request): ?array
    {
        $user = $request->user();
        if (! $user) {
            return null;
        }

        $membership = $user->memberships()
            ->where('status', 'active')
            ->with(['business.locations' => fn ($query) => $query->where('is_active', true)->oldest()])
            ->latest('joined_at')
            ->first();
        $business = $membership?->business;

        if (! $business) {
            return null;
        }

        return [
            'id' => $business->public_id,
            'name' => $business->name,
            'status' => $business->status->value,
            'role' => $membership->role->value,
            'location' => $business->locations->first()?->name,
            'notificationCount' => NotificationDelivery::query()
                ->whereHas('appointment', fn ($query) => $query->where('business_id', $business->getKey()))
                ->count(),
        ];
    }

    /** @return array{pendingApplications: int}|null */
    private function platform(Request $request): ?array
    {
        $user = $request->user();
        if (! $user?->hasRole('platform-admin')) {
            return null;
        }

        return [
            'pendingApplications' => BusinessApplication::whereIn('status', ['pending', 'under_review'])->count(),
        ];
    }
}
