<?php

use App\Enums\ContactTopic;
use App\Filament\Resources\ContactMessages\Pages\ListContactMessages;
use App\Filament\Resources\ContactMessages\Pages\ViewContactMessage;
use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use App\Models\User;
use Filament\Actions\Testing\TestAction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Livewire\Livewire;

uses(RefreshDatabase::class);

/**
 * A message as a person sends it: the form opened a little while ago.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function contactMessage(array $overrides = []): array
{
    $token = StoreContactMessageRequest::issueFormToken();
    test()->travel(10)->seconds();

    return [
        'topic' => 'curtains',
        'name' => 'Rania Haddad',
        'phone' => '+961 3 145 782',
        'message' => 'Three windows in the living room.',
        'form_token' => $token,
        ...$overrides,
    ];
}

test('the page hands the form a token', function () {
    $this->get(route('contact'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('contact/index')
            ->where('formToken', fn (string $token) => $token !== ''));
});

test('a visitor can send a message', function () {
    $this->from(route('contact'))
        ->post(route('contact.store'), contactMessage())
        ->assertRedirect(route('contact'))
        ->assertSessionHasNoErrors();

    $message = ContactMessage::sole();

    expect($message->topic)->toBe(ContactTopic::Curtains)
        ->and($message->name)->toBe('Rania Haddad')
        ->and($message->read_at)->toBeNull();
});

test('an email can be left alongside the phone number', function () {
    $this->post(route('contact.store'), contactMessage(['email' => 'rania@example.com']))
        ->assertSessionHasNoErrors();

    expect(ContactMessage::sole())
        ->phone->toBe('+961 3 145 782')
        ->email->toBe('rania@example.com');
});

test('a phone number needs its country code and a believable length', function (string $phone) {
    $this->post(route('contact.store'), contactMessage(['phone' => $phone]))
        ->assertSessionHasErrors('phone');
})->with([
    'no country code' => '03 145 782',
    'too short' => '+961 31',
    'letters' => '+961 call me',
]);

test('markup is stripped before the message is kept', function () {
    $this->post(route('contact.store'), contactMessage([
        'name' => '<b>Rania</b>',
        'message' => '<script>alert(1)</script>Three windows, please.',
    ]))->assertSessionHasNoErrors();

    expect(ContactMessage::sole())
        ->name->toBe('Rania')
        ->message->toBe('alert(1)Three windows, please.');
});

test('a message needs a phone number and a known topic', function () {
    $this->post(route('contact.store'), contactMessage([
        'topic' => 'hammocks',
        'phone' => null,
    ]))->assertSessionHasErrors(['topic', 'phone']);

    expect(ContactMessage::count())->toBe(0);
});

test('a message full of links is refused', function () {
    $this->post(route('contact.store'), contactMessage([
        'message' => 'Visit https://a.test https://b.test https://c.test',
    ]))->assertSessionHasErrors('message');
});

test('a missing or forged token is refused', function (?string $token) {
    $this->post(route('contact.store'), contactMessage(['form_token' => $token]))
        ->assertSessionHasErrors('form_token');

    expect(ContactMessage::count())->toBe(0);
})->with([
    'missing' => null,
    'forged' => 'not-a-real-token',
]);

test('a form left open too long has to be refreshed', function () {
    $message = contactMessage();
    $this->travel(StoreContactMessageRequest::MAX_FORM_AGE_SECONDS + 1)->seconds();

    $this->post(route('contact.store'), $message)->assertSessionHasErrors('form_token');
});

test('a bot filling the hidden field is told it went through but nothing is kept', function () {
    $this->post(route('contact.store'), contactMessage(['website' => 'https://spam.example']))
        ->assertSessionHasNoErrors();

    expect(ContactMessage::count())->toBe(0);
});

test('a form sent faster than a person could is quietly dropped', function () {
    $message = contactMessage();
    $message['form_token'] = StoreContactMessageRequest::issueFormToken();

    $this->post(route('contact.store'), $message)->assertSessionHasNoErrors();

    expect(ContactMessage::count())->toBe(0);
});

test('a visitor can only send a few messages a minute', function () {
    foreach (range(1, 3) as $attempt) {
        $this->post(route('contact.store'), contactMessage())->assertRedirect();
    }

    $this->post(route('contact.store'), contactMessage())->assertTooManyRequests();
});

test('opening a message in the dashboard marks it read', function () {
    $this->actingAs(User::factory()->create());
    $message = ContactMessage::factory()->create();

    Livewire::test(ViewContactMessage::class, ['record' => $message->getRouteKey()])
        ->assertSee($message->name);

    expect($message->refresh()->read_at)->not->toBeNull();
});

test('messages can be marked read and unread from the inbox', function () {
    $this->actingAs(User::factory()->create());
    $unread = ContactMessage::factory()->create();
    $read = ContactMessage::factory()->read()->create();

    Livewire::test(ListContactMessages::class)
        ->assertActionVisible(TestAction::make('markAsRead')->table($unread))
        ->assertActionHidden(TestAction::make('markAsRead')->table($read))
        ->callAction(TestAction::make('markAsRead')->table($unread))
        ->callAction(TestAction::make('markAsUnread')->table($read));

    expect($unread->refresh()->isUnread())->toBeFalse()
        ->and($read->refresh()->isUnread())->toBeTrue();
});

test('several messages can be marked read at once', function () {
    $this->actingAs(User::factory()->create());
    $messages = ContactMessage::factory()->count(3)->create();

    Livewire::test(ListContactMessages::class)
        ->selectTableRecords($messages->modelKeys())
        ->callAction(TestAction::make('markAsRead')->table()->bulk());

    expect(ContactMessage::query()->whereNull('read_at')->count())->toBe(0);
});
