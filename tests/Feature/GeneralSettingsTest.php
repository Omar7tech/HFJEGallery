<?php

use App\Filament\Pages\ManageGeneral;
use App\Models\User;
use App\Settings\GeneralSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Livewire\Livewire;

uses(RefreshDatabase::class);

test('admins can save contact details and social links', function () {
    $this->actingAs(User::factory()->create());

    Livewire::test(ManageGeneral::class)
        ->fillForm([
            'phone_number_enabled' => true,
            'phone_number' => '+961 3 145 782',
            'email' => 'studio@hfje.com',
            'social_links' => [
                ['label' => 'Behance', 'url' => 'https://behance.net/hfje'],
            ],
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    $settings = app(GeneralSettings::class)->refresh();

    expect($settings->usablePhoneNumber())->toBe('+961 3 145 782')
        ->and($settings->email)->toBe('studio@hfje.com')
        ->and($settings->usableSocialLinks())->toBe([
            ['label' => 'Behance', 'url' => 'https://behance.net/hfje'],
        ]);
});

test('an enabled phone number is required', function () {
    $this->actingAs(User::factory()->create());

    Livewire::test(ManageGeneral::class)
        ->fillForm(['phone_number_enabled' => true, 'phone_number' => null])
        ->call('save')
        ->assertHasFormErrors(['phone_number' => 'required_if']);
});

test('pages share the visible contact details and complete social links', function () {
    $settings = app(GeneralSettings::class);
    $settings->phone_number_enabled = false;
    $settings->phone_number = '+961 3 145 782';
    $settings->email = 'studio@hfje.com';
    $settings->social_links = [
        ['label' => 'Behance', 'url' => 'https://behance.net/hfje'],
        ['label' => '', 'url' => 'https://example.com/hfje'],
        ['label' => 'Instagram', 'url' => ''],
    ];
    $settings->save();

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('contact', ['phoneNumber' => null, 'email' => 'studio@hfje.com'])
            ->where('socials', [
                ['label' => 'Behance', 'url' => 'https://behance.net/hfje'],
            ])
            ->etc()
        );
});
