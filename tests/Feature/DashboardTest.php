<?php

use App\Filament\Widgets\CatalogueStats;
use App\Filament\Widgets\InboxStats;
use App\Filament\Widgets\LatestMessages;
use App\Filament\Widgets\MessagesByTopicChart;
use App\Filament\Widgets\MessagesTrendChart;
use App\Filament\Widgets\NeedsAttention;
use App\Models\BayteCategory;
use App\Models\BayteProduct;
use App\Models\ContactMessage;
use App\Models\User;
use App\Settings\BayteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('the dashboard opens', function () {
    $this->get('/admin')->assertOk();
});

test('every widget renders, with messages and without', function (string $widget) {
    Livewire::test($widget)->assertOk();

    ContactMessage::factory()->count(3)->create();
    ContactMessage::factory()->read()->create(['created_at' => now()->subWeeks(3)]);

    Livewire::test($widget)->assertOk();
})->with([
    InboxStats::class,
    MessagesTrendChart::class,
    MessagesByTopicChart::class,
    LatestMessages::class,
    CatalogueStats::class,
    NeedsAttention::class,
]);

test('the inbox counts unread messages and flags the overdue ones', function () {
    ContactMessage::factory()->create();
    ContactMessage::factory()->create(['created_at' => now()->subDays(5)]);
    ContactMessage::factory()->read()->create();

    Livewire::test(InboxStats::class)
        ->assertSee('Unread messages')
        ->assertSee('1 waiting over 2 days');
});

test('the checklist lists what needs fixing and nothing else', function () {
    $category = BayteCategory::factory()->create();
    BayteProduct::factory()->for($category, 'category')->count(2)->create();

    Livewire::test(NeedsAttention::class)
        ->assertSee('2 BAYTÉ pieces without a photo')
        ->assertSee('No WhatsApp number for BAYTÉ')
        ->assertDontSee('with no pieces');

    $settings = app(BayteSettings::class);
    $settings->whatsapp_number = '+961 3 145 782';
    $settings->save();

    Livewire::test(NeedsAttention::class)->assertDontSee('No WhatsApp number for BAYTÉ');
});
