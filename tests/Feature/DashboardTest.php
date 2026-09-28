<?php

use App\Filament\Widgets\BayteByCategoryChart;
use App\Filament\Widgets\CatalogueStats;
use App\Filament\Widgets\ContentGrowthChart;
use App\Filament\Widgets\InboxStats;
use App\Filament\Widgets\LatestMessages;
use App\Filament\Widgets\LivingEditChoicesChart;
use App\Filament\Widgets\MessagesByTopicChart;
use App\Filament\Widgets\MessagesTrendChart;
use App\Filament\Widgets\NeedsAttention;
use App\Filament\Widgets\PhotoCoverageChart;
use App\Filament\Widgets\ProjectsByCategoryChart;
use App\Filament\Widgets\ProjectsByYearChart;
use App\Filament\Widgets\TopTagsChart;
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

test('every widget renders, empty and with content', function (string $widget) {
    Livewire::test($widget)->assertOk();

    $category = BayteCategory::factory()->create();
    BayteProduct::factory()->for($category, 'category')->count(2)->create();
    ContactMessage::factory()->count(2)->create();

    Livewire::test($widget)->assertOk();
})->with([
    InboxStats::class,
    MessagesTrendChart::class,
    MessagesByTopicChart::class,
    LatestMessages::class,
    CatalogueStats::class,
    ContentGrowthChart::class,
    PhotoCoverageChart::class,
    ProjectsByCategoryChart::class,
    ProjectsByYearChart::class,
    TopTagsChart::class,
    BayteByCategoryChart::class,
    LivingEditChoicesChart::class,
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

test('the BAYTÉ chart splits each category by photo', function () {
    $category = BayteCategory::factory()->create(['name' => 'Lounge Chairs']);
    BayteProduct::factory()->for($category, 'category')->count(3)->create();

    $chart = Livewire::test(BayteByCategoryChart::class)->instance();
    $data = (fn (): array => $this->getData())->call($chart);

    expect($data['labels'])->toBe(['Lounge Chairs'])
        ->and($data['datasets'][0]['data'])->toBe([0])
        ->and($data['datasets'][1]['data'])->toBe([3]);
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
