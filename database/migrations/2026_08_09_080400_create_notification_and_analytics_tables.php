<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_tokens', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('platform', 16);
            $table->text('token');
            $table->string('device_name')->nullable();
            $table->dateTime('last_used_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'platform']);
        });

        Schema::create('notification_deliveries', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('channel', 16);
            $table->string('template', 64);
            $table->string('status', 24)->default('pending')->index();
            $table->string('provider_reference')->nullable();
            $table->text('failure_message')->nullable();
            $table->dateTime('sent_at')->nullable();
            $table->timestamps();

            $table->index(['appointment_id', 'template', 'channel']);
        });

        Schema::create('daily_business_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->restrictOnDelete();
            $table->foreignId('location_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('scope', 32)->default('all');
            $table->date('metric_date');
            $table->unsignedInteger('appointments_count')->default(0);
            $table->unsignedInteger('completed_count')->default(0);
            $table->unsignedInteger('cancelled_count')->default(0);
            $table->unsignedInteger('no_show_count')->default(0);
            $table->unsignedBigInteger('revenue_minor')->default(0);
            $table->unsignedInteger('new_customers_count')->default(0);
            $table->timestamps();

            $table->unique(['business_id', 'scope', 'metric_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_business_metrics');
        Schema::dropIfExists('notification_deliveries');
        Schema::dropIfExists('device_tokens');
    }
};
