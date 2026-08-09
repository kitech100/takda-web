<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $platformAdmin = Role::firstOrCreate(['name' => 'platform-admin', 'guard_name' => 'web']);

        if (app()->isLocal()) {
            $user = User::withTrashed()->firstOrCreate(
                ['email' => 'admin@takda.test'],
                [
                    'name' => 'Takda Administrator',
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                ],
            );

            if ($user->trashed()) {
                $user->restore();
            }

            $user->assignRole($platformAdmin);

            $this->call(DemoBusinessSeeder::class);
        }
    }
}
