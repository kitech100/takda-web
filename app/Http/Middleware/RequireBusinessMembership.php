<?php

namespace App\Http\Middleware;

use App\Support\CurrentBusiness;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireBusinessMembership
{
    public function __construct(private readonly CurrentBusiness $currentBusiness) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $this->currentBusiness->for($request->user())) {
            return redirect()->route('onboarding.details');
        }

        return $next($request);
    }
}
