<?php

namespace Database\Seeders;

use App\Enums\AppointmentStatus;
use App\Enums\BusinessStatus;
use App\Enums\MembershipRole;
use App\Models\Appointment;
use App\Models\Business;
use App\Models\BusinessApplication;
use App\Models\BusinessCustomer;
use App\Models\Location;
use App\Models\NotificationDelivery;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\StaffProfile;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoBusinessSeeder extends Seeder
{
    public function run(): void
    {
        $owner = $this->user('owner@takda.test', 'Maria Reyes', '+63 917 100 2000');
        $business = Business::updateOrCreate(
            ['slug' => 'makati-wellness-studio'],
            ['name' => 'Makati Wellness Studio', 'description' => 'Massage and wellness services in Makati.', 'email' => 'hello@wellnessstudio.ph', 'phone' => '+63 2 8123 4567', 'status' => BusinessStatus::Active, 'timezone' => 'Asia/Manila', 'confirmation_mode' => 'automatic', 'reminder_minutes' => [1440, 120], 'approved_at' => now(), 'published_at' => now()],
        );
        $business->memberships()->withTrashed()->firstOrCreate(
            ['user_id' => $owner->getKey()],
            ['role' => MembershipRole::Owner, 'status' => 'active', 'joined_at' => now()],
        );

        $location = Location::updateOrCreate(
            ['business_id' => $business->getKey(), 'slug' => 'main-branch'],
            ['name' => 'Main Branch', 'phone' => '+63 2 8123 4567', 'address_line_1' => '8472 Kalayaan Avenue', 'city' => 'Makati City', 'province' => 'Metro Manila', 'postal_code' => '1209', 'timezone' => 'Asia/Manila', 'opening_hours' => $this->openingHours(), 'is_active' => true],
        );

        $categories = collect(['Massage', 'Skin Care', 'Consultation'])->mapWithKeys(function (string $name) use ($business): array {
            $category = ServiceCategory::updateOrCreate(['business_id' => $business->getKey(), 'slug' => str($name)->slug()], ['name' => $name]);

            return [$name => $category];
        });
        $serviceDefinitions = [
            ['Swedish Massage', 'Massage', 120000, 60], ['Deep Tissue Massage', 'Massage', 180000, 90],
            ['Hot Stone Therapy', 'Massage', 150000, 75], ['Aromatherapy Massage', 'Massage', 110000, 60],
            ['Signature Facial', 'Skin Care', 95000, 45], ['Wellness Consultation', 'Consultation', 50000, 30],
        ];
        $services = collect($serviceDefinitions)->map(function (array $definition) use ($business, $categories): Service {
            return Service::updateOrCreate(
                ['business_id' => $business->getKey(), 'slug' => str($definition[0])->slug()],
                ['service_category_id' => $categories[$definition[1]]->getKey(), 'name' => $definition[0], 'price_minor' => $definition[2], 'duration_minutes' => $definition[3], 'buffer_after_minutes' => 10, 'is_visible' => true],
            );
        });

        $staff = collect([['Maria Reyes', 'Senior Therapist'], ['Juan Domingo', 'Massage Therapist'], ['Sofia Garcia', 'Esthetician']])->map(function (array $definition) use ($business, $location, $services): StaffProfile {
            $profile = StaffProfile::updateOrCreate(['business_id' => $business->getKey(), 'display_name' => $definition[0]], ['title' => $definition[1], 'is_bookable' => true]);
            $profile->locations()->syncWithoutDetaching([$location->getKey()]);
            $profile->services()->syncWithoutDetaching($services->pluck('id')->all());

            return $profile;
        });

        $customers = collect([['ana@takda.test', 'Ana Santos', '+63 917 123 4567'], ['carlos@takda.test', 'Carlos Reyes', '+63 918 234 5678'], ['lisa@takda.test', 'Lisa Tan', '+63 921 567 8901']])->map(function (array $definition) use ($business): BusinessCustomer {
            $user = $this->user($definition[0], $definition[1], $definition[2]);

            return BusinessCustomer::withTrashed()->firstOrCreate(['business_id' => $business->getKey(), 'user_id' => $user->getKey()], ['internal_notes' => 'Development customer record.']);
        });

        $start = CarbonImmutable::now('Asia/Manila')->addHour()->startOfHour();
        foreach (range(0, 7) as $index) {
            $service = $services[$index % $services->count()];
            $profile = $staff[$index % $staff->count()];
            $customer = $customers[$index % $customers->count()];
            $startsAt = $start->addHours($index * 2)->utc();
            $endsAt = $startsAt->addMinutes($service->duration_minutes);
            $status = [AppointmentStatus::Confirmed, AppointmentStatus::Pending, AppointmentStatus::Completed, AppointmentStatus::InProgress][$index % 4];
            $appointment = Appointment::updateOrCreate(
                ['reference' => 'TKD-DEMO-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT)],
                ['business_id' => $business->getKey(), 'location_id' => $location->getKey(), 'service_id' => $service->getKey(), 'staff_profile_id' => $profile->getKey(), 'customer_user_id' => $customer->user_id, 'business_customer_id' => $customer->getKey(), 'status' => $status, 'payment_status' => 'unpaid', 'source' => 'web', 'starts_at' => $startsAt, 'ends_at' => $endsAt, 'blocked_starts_at' => $startsAt, 'blocked_ends_at' => $endsAt->addMinutes(10), 'timezone' => 'Asia/Manila', 'price_minor' => $service->price_minor, 'currency' => 'PHP'],
            );
            NotificationDelivery::firstOrCreate(
                ['appointment_id' => $appointment->getKey(), 'template' => 'appointment_created', 'channel' => 'email'],
                ['user_id' => $customer->user_id, 'status' => 'sent', 'sent_at' => now()],
            );
        }

        $this->seedPendingApplication();
    }

    private function seedPendingApplication(): void
    {
        $owner = $this->user('luna@takda.test', 'Maria Luna', '+63 917 441 8090');
        $business = Business::updateOrCreate(['slug' => 'luna-beauty-lounge'], ['name' => 'Luna Beauty Lounge', 'description' => 'A modern neighborhood salon for hair, nails, facials, and makeup.', 'email' => 'maria@lunabeauty.ph', 'phone' => '+63 917 441 8090', 'status' => BusinessStatus::PendingApproval]);
        $business->memberships()->withTrashed()->firstOrCreate(['user_id' => $owner->getKey()], ['role' => MembershipRole::Owner, 'status' => 'active', 'joined_at' => now()]);
        Location::updateOrCreate(['business_id' => $business->getKey(), 'slug' => 'main-branch'], ['name' => 'Main Branch', 'phone' => '+63 917 441 8090', 'address_line_1' => 'Legazpi Village', 'city' => 'Makati City', 'timezone' => 'Asia/Manila', 'opening_hours' => $this->openingHours()]);
        BusinessApplication::firstOrCreate(
            ['owner_id' => $owner->getKey(), 'business_id' => $business->getKey()],
            ['status' => 'pending', 'submitted_data' => ['details' => ['name' => $business->name, 'category' => 'Beauty Salon', 'email' => $business->email, 'phone' => $business->phone], 'location' => ['name' => 'Main Branch']], 'submitted_at' => now()],
        );
    }

    private function user(string $email, string $name, string $phone): User
    {
        return User::withTrashed()->updateOrCreate(['email' => $email], ['name' => $name, 'phone' => $phone, 'email_verified_at' => now(), 'password' => Hash::make('password'), 'deleted_at' => null]);
    }

    /** @return list<array{day: int, enabled: bool, opens: string|null, closes: string|null}> */
    private function openingHours(): array
    {
        return array_values(collect(range(0, 6))->map(fn (int $day): array => ['day' => $day, 'enabled' => $day !== 6, 'opens' => $day === 6 ? null : '09:00', 'closes' => $day === 6 ? null : '20:00'])->all());
    }
}
