<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use RuntimeException;

class AppointmentConflictException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('The selected time is no longer available.');
    }

    public function render(Request $request): JsonResponse|RedirectResponse
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => $this->getMessage(),
                'code' => 'APPOINTMENT_SLOT_UNAVAILABLE',
                'errors' => (object) [],
            ], 409);
        }

        return back()->withErrors(['starts_at' => $this->getMessage()]);
    }
}
