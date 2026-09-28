<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\BayteCategory;
use App\Models\BayteProduct;
use App\Models\CurtainWork;
use App\Models\Project;
use App\Models\WorkCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

/**
 * The schema.org graph printed in the page's head, decoded.
 *
 * @return array<string, mixed>
 */
function schemaGraph(string $html): array
{
    preg_match('/<script data-inertia="schema" type="application\/ld\+json">(.*?)<\/script>/s', $html, $matches);

    return json_decode($matches[1], true, flags: JSON_THROW_ON_ERROR);
}

test('a project page is titled, described and marked up as that project', function () {
    $homes = WorkCategory::factory()->create(['name' => 'Homes', 'slug' => 'homes']);
    Project::factory()->for($homes, 'category')->create([
        'name' => 'Cedar House',
        'slug' => 'cedar-house',
        'location' => 'Faqra',
        'year' => 2024,
        'summary' => 'A mountain home dressed in linen and oak.',
    ]);

    $html = $this->get('/work/homes/cedar-house')->assertOk()->getContent();

    expect($html)
        ->toContain('<title data-inertia="title">Cedar House, Faqra | Interior Design | HFJE</title>')
        ->toContain('<meta data-inertia="description" name="description" content="A mountain home dressed in linen and oak.">')
        ->toContain('<link data-inertia="canonical" rel="canonical" href="'.url('/work/homes/cedar-house').'">')
        ->toContain('<meta data-inertia="og:image" property="og:image" content="'.asset('og/hfje.jpg').'">')
        ->toContain('<noscript>');

    $work = collect(schemaGraph($html)['@graph'])->firstWhere('@type', 'CreativeWork');

    expect($work)
        ->name->toBe('Cedar House')
        ->genre->toBe('Homes')
        ->dateCreated->toBe('2024')
        ->and($work['locationCreated']['name'])->toBe('Faqra, Lebanon');
});

test('a project without a summary is described by its story', function () {
    $homes = WorkCategory::factory()->create(['slug' => 'homes']);
    Project::factory()->for($homes, 'category')->create([
        'slug' => 'cedar-house',
        'summary' => null,
        'description' => '<p>Linen curtains</p><p>and an oak table.</p>',
    ]);

    $this->get('/work/homes/cedar-house')
        ->assertOk()
        ->assertSee('<meta data-inertia="description" name="description" content="Linen curtains and an oak table.">', false);
});

test('text from the dashboard cannot break out of the head', function () {
    $homes = WorkCategory::factory()->create(['slug' => 'homes']);
    Project::factory()->for($homes, 'category')->create([
        'name' => 'Loft</script><script>alert(1)</script>',
        'slug' => 'loft',
        'summary' => '"><script>alert(2)</script>',
    ]);

    $html = $this->get('/work/homes/loft')->assertOk()->getContent();

    expect($html)
        ->not->toContain('<script>alert(1)</script>')
        ->not->toContain('<script>alert(2)</script>')
        ->toContain('&lt;script&gt;alert(2)&lt;/script&gt;');

    expect(collect(schemaGraph($html)['@graph'])->firstWhere('@type', 'CreativeWork')['name'])
        ->toBe('Loft</script><script>alert(1)</script>');
});

test('the canonical drops tracking parameters', function () {
    WorkCategory::factory()->has(Project::factory())->create(['slug' => 'homes']);

    $this->get('/work/homes?fbclid=abc&utm_source=whatsapp')
        ->assertOk()
        ->assertSee('<link data-inertia="canonical" rel="canonical" href="'.url('/work/homes').'">', false);
});

test('a BAYTÉ shelf is its own indexable page', function () {
    $sofas = BayteCategory::factory()->create(['name' => 'Sofas', 'slug' => 'sofas']);
    BayteProduct::factory()->for($sofas, 'category')->create();

    $this->get('/bayte?category=sofas&page=2')
        ->assertOk()
        ->assertSee('<title data-inertia="title">Sofas | BAYTÉ Furniture | HFJE</title>', false)
        ->assertSee('<link data-inertia="canonical" rel="canonical" href="'.url('/bayte?category=sofas').'">', false)
        ->assertSee('content="index, follow', false);
});

test('a BAYTÉ search is followed but not indexed', function () {
    BayteProduct::factory()->create(['name' => 'Oak Chair']);

    $this->get('/bayte?search=oak')
        ->assertOk()
        ->assertSee('<meta data-inertia="robots" name="robots" content="noindex, follow">', false)
        ->assertDontSee('<noscript>', false);
});

test('a partial reload still carries the head of the page it lands on', function () {
    BayteProduct::factory()->create(['name' => 'Oak Chair']);

    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => app(HandleInertiaRequests::class)->version(request()),
        'X-Inertia-Partial-Component' => 'bayte/index',
        'X-Inertia-Partial-Data' => 'products',
    ])->get('/bayte?search=oak')
        ->assertOk()
        ->assertJsonPath('props.head', fn (array $head): bool => in_array(
            '<meta data-inertia="robots" name="robots" content="noindex, follow">',
            $head,
            true,
        ));
});

test('every page shares its head with the app', function () {
    $this->get('/about')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('head.0', '<title data-inertia="title">About Us: A Family Interior Studio Since 1999 | HFJE</title>'));
});

test('the sitemap lists every project and curtain work with its photos', function () {
    $homes = WorkCategory::factory()->create(['slug' => 'homes']);
    Project::factory()->for($homes, 'category')->create(['slug' => 'cedar-house']);
    CurtainWork::factory()->create(['slug' => 'sheer-loft']);
    BayteProduct::factory()->for(BayteCategory::factory()->create(['slug' => 'sofas']), 'category')->create();

    $this->get('/sitemap.xml')
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->assertSee('<loc>'.url('/work/homes').'</loc>', false)
        ->assertSee('<loc>'.url('/work/homes/cedar-house').'</loc>', false)
        ->assertSee('<loc>'.url('/curtains/work/sheer-loft').'</loc>', false)
        ->assertSee('<loc>'.e(url('/bayte?category=sofas')).'</loc>', false)
        ->assertSee('<image:loc>'.asset(WorkCategory::PLACEHOLDER_IMAGE).'</image:loc>', false);
});

test('robots.txt opens the site, closes the dashboard and points to the sitemap', function () {
    $this->get('/robots.txt')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('Disallow: /admin', false)
        ->assertSee('Disallow: /living-edit/mood-board', false)
        ->assertSee('Sitemap: '.url('/sitemap.xml'), false)
        ->assertDontSee('Disallow: /storage', false);
});
