<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_customers', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('business_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->text('internal_notes')->nullable();
            $table->unsignedInteger('completed_visits')->default(0);
            $table->dateTime('last_visited_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['business_id', 'user_id']);
        });

        Schema::create('staff_booking_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_profile_id')->constrained()->restrictOnDelete();
            $table->date('booking_date');
            $table->timestamps();
            $table->unique(['staff_profile_id', 'booking_date']);
        });

        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->string('reference', 24)->unique();
            $table->foreignId('business_id')->constrained()->restrictOnDelete();
            $table->foreignId('location_id')->constrained()->restrictOnDelete();
            $table->foreignId('service_id')->constrained()->restrictOnDelete();
            $table->foreignId('staff_profile_id')->constrained()->restrictOnDelete();
            $table->foreignId('customer_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('business_customer_id')->constrained()->restrictOnDelete();
            $table->string('status', 24)->default('pending')->index();
            $table->string('payment_status', 24)->default('unpaid');
            $table->string('source', 16)->default('mobile');
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->dateTime('blocked_starts_at');
            $table->dateTime('blocked_ends_at');
            $table->string('timezone', 64);
            $table->unsignedInteger('price_minor');
            $table->char('currency', 3)->default('PHP');
            $table->text('customer_notes')->nullable();
            $table->text('internal_notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->dateTime('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['staff_profile_id', 'blocked_starts_at', 'blocked_ends_at'], 'appointments_staff_blocked_idx');
            $table->index(['business_id', 'starts_at']);
            $table->index(['location_id', 'starts_at']);
            $table->index(['customer_user_id', 'starts_at']);
        });

        Schema::create('appointment_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->restrictOnDelete();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->string('event_type', 48);
            $table->json('properties')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['appointment_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_events');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('staff_booking_days');
        Schema::dropIfExists('business_customers');
    }
};
