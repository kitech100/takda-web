<?php

namespace App\Http\Controllers;

use App\Queries\DashboardQuery;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class DashboardController extends Controller
{
    public function __invoke(Request $request, DashboardQuery $dashboard): Response|HttpResponse
    {
        if (! $request->user()->memberships()->where('status', 'active')->exists()) {
            return Inertia::location($request->user()->hasRole('platform-admin')
                ? route('admin.dashboard')
                : route('onboarding.details'));
        }

        return Inertia::render('dashboard', $dashboard->for($request->user()));
    }
}
