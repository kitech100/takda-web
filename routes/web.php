<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\BusinessOperationsController;
use App\Http\Controllers\BusinessSectionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\PlatformAdminController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['guest', 'throttle:10,1'])->group(function () {
    Route::get('auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');
});

Route::middleware(['auth', 'verified'])->get('dashboard', DashboardController::class)->name('dashboard');

Route::middleware(['auth', 'verified', 'business.member'])->group(function () {
    Route::get('settings/booking-rules', BusinessSectionController::class)
        ->defaults('section', 'settings')
        ->name('booking.settings');
    Route::get('{section}', BusinessSectionController::class)
        ->whereIn('section', [
            'calendar',
            'appointments',
            'customers',
            'services',
            'staff',
            'locations',
            'analytics',
            'notifications',
            'archived',
        ])
        ->name('business.section');

    Route::post('business/appointments', [BusinessOperationsController::class, 'storeAppointment'])->name('business.appointments.store');
    Route::patch('business/appointments/{appointment}/status', [BusinessOperationsController::class, 'updateAppointmentStatus'])->name('business.appointments.status');
    Route::delete('business/appointments/{appointment}', [BusinessOperationsController::class, 'destroyAppointment'])->name('business.appointments.destroy');
    Route::post('business/customers', [BusinessOperationsController::class, 'storeCustomer'])->name('business.customers.store');
    Route::patch('business/customers/{customer}', [BusinessOperationsController::class, 'updateCustomer'])->name('business.customers.update');
    Route::post('business/services', [BusinessOperationsController::class, 'storeService'])->name('business.services.store');
    Route::patch('business/services/{service}', [BusinessOperationsController::class, 'updateService'])->name('business.services.update');
    Route::post('business/staff', [BusinessOperationsController::class, 'storeStaff'])->name('business.staff.store');
    Route::patch('business/staff/{staff}', [BusinessOperationsController::class, 'updateStaff'])->name('business.staff.update');
    Route::post('business/locations', [BusinessOperationsController::class, 'storeLocation'])->name('business.locations.store');
    Route::patch('business/locations/{location}', [BusinessOperationsController::class, 'updateLocation'])->name('business.locations.update');
    Route::patch('business/settings/booking-rules', [BusinessOperationsController::class, 'updateBookingRules'])->name('business.settings.update');
    Route::delete('business/archive/{type}/{id}', [BusinessOperationsController::class, 'archive'])->name('business.archive');
    Route::patch('business/restore/{type}/{id}', [BusinessOperationsController::class, 'restore'])->name('business.restore');

});

Route::middleware('auth')->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'details'])->name('onboarding.details');
    Route::post('onboarding', [OnboardingController::class, 'storeDetails'])->name('onboarding.details.store');
    Route::get('onboarding/location', [OnboardingController::class, 'location'])->name('onboarding.location');
    Route::post('onboarding/location', [OnboardingController::class, 'storeLocation'])->name('onboarding.location.store');
    Route::get('onboarding/review', [OnboardingController::class, 'review'])->name('onboarding.review');
    Route::post('onboarding/review', [OnboardingController::class, 'submit'])->name('onboarding.submit');
});

Route::middleware(['auth', 'verified', 'platform.admin'])->prefix('platform-admin')->name('admin.')->group(function () {
    Route::get('/', [PlatformAdminController::class, 'dashboard'])->name('dashboard');
    Route::get('applications', [PlatformAdminController::class, 'applications'])->name('applications');
    Route::get('applications/{application}', [PlatformAdminController::class, 'review'])->name('applications.review');
    Route::patch('applications/{application}', [PlatformAdminController::class, 'decide'])->name('applications.decide');
    Route::get('businesses', [PlatformAdminController::class, 'businesses'])->name('businesses');
    Route::patch('businesses/{business}/status', [PlatformAdminController::class, 'updateBusinessStatus'])->name('businesses.status');
    Route::get('settings', [PlatformAdminController::class, 'settings'])->name('settings');
});

require __DIR__.'/settings.php';
