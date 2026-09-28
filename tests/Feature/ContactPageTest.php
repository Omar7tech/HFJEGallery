<?php

use App\Enums\ContactTopic;
use App\Filament\Resources\ContactMessages\Pages\ViewContactMessage;
use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

test('a visitor can send a message', function () {
    $this->from(route('contact'))
        ->post(route('contact.store'), [
            'topic' => 'curtains',
            'name' => 'Rania Haddad',
            'email' => 'rania@example.com',
            'message' => 'Three windows in the living room.',
        ])
        ->assertRedirect(route('contact'))
        ->assertSessionHasNoErrors();

    $message = ContactMessage::sole();

    expect($message->topic)->toBe(ContactTopic::Curtains)
        ->and($message->name)->toBe('Rania Haddad')
        ->and($message->read_at)->toBeNull();
});

test('a phone number is enough to be reached', function () {
    $this->post(route('contact.store'), [
        'topic' => 'bayte',
        'name' => 'Karim',
        'phone' => '+961 3 145 782',
        'message' => 'The caramel chair.',
    ])->assertSessionHasNoErrors();

    expect(ContactMessage::sole()->phone)->toBe('+961 3 145 782');
});

test('a message needs a way to reply and a known topic', function () {
    $this->post(route('contact.store'), [
        'topic' => 'hammocks',
        'name' => 'Karim',
        'message' => 'Hello',
    ])->assertSessionHasErrors(['topic', 'email', 'phone']);

    expect(ContactMessage::count())->toBe(0);
});

test('a filled honeypot is turned away', function () {
    $this->post(route('contact.store'), [
        'topic' => 'other',
        'name' => 'Bot',
        'email' => 'bot@example.com',
        'message' => 'Buy now',
        'website' => 'https://spam.example',
    ])->assertSessionHasErrors('website');

    expect(ContactMessage::count())->toBe(0);
});

test('opening a message in the dashboard marks it read', function () {
    $this->actingAs(User::factory()->create());
    $message = ContactMessage::factory()->create();

    Livewire::test(ViewContactMessage::class, ['record' => $message->getRouteKey()])
        ->assertSee($message->name);

    expect($message->refresh()->read_at)->not->toBeNull();
});
