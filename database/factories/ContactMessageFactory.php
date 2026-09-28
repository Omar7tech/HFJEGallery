<?php

namespace Database\Factories;

use App\Enums\ContactTopic;
use App\Models\ContactMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContactMessage>
 */
class ContactMessageFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'topic' => fake()->randomElement(ContactTopic::cases()),
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => '+961 3 '.fake()->numerify('### ###'),
            'message' => fake()->paragraph(),
        ];
    }

    public function read(): static
    {
        return $this->state(fn (): array => ['read_at' => now()]);
    }
}
