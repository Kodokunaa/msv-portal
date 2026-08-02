<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'account_status_id' => \Illuminate\Support\Facades\DB::table('account_statuses')->where('code', 'active')->value('id'),
            'remember_token' => Str::random(10),
        ];
    }


    public function active(): static
    {
        return $this->state(fn () => [
            'account_status_id' => \Illuminate\Support\Facades\DB::table('account_statuses')->where('code', 'active')->value('id'),
        ]);
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }
}
