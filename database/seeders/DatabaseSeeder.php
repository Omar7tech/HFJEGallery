<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(LivingEditSeeder::class);

        User::updateOrCreate([
            'email' => 'admin@hfje.com',
        ], [
            'name' => 'Admin',
            'email' => 'admin@hfje.com',
            'password' => bcrypt('password'),
        ]);
    }
}
