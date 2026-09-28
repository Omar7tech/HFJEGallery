<?php

use App\Filament\Pages\ManageBayte;
use App\Models\User;
use App\Settings\BayteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

test('admins can set the whatsapp number bayte selections go to', function () {
    $this->actingAs(User::factory()->create());

    Livewire::test(ManageBayte::class)
        ->fillForm(['whatsapp_number' => '+961 3 145-782'])
        ->call('save')
        ->assertHasNoFormErrors();

    expect(app(BayteSettings::class)->refresh()->whatsappDigits())->toBe('9613145782');
});

test('a whatsapp number must look like a phone number', function () {
    $this->actingAs(User::factory()->create());

    Livewire::test(ManageBayte::class)
        ->fillForm(['whatsapp_number' => 'call me'])
        ->call('save')
        ->assertHasFormErrors(['whatsapp_number' => 'regex']);
});
