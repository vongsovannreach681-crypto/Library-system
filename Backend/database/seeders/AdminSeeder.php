<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;


class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'vongsovannreach681@gmail.com'],
            [
                'name' => 'Reach',
                'password' => Hash::make('Reach123!@#'),
                'role' => 'admin',
            ]
        );
    }
}
