<?php

namespace App\Support\Seo;

use App\Models\BayteCategory;
use App\Models\BayteProduct;
use App\Models\CurtainStyle;
use App\Models\CurtainWork;
use App\Models\Project;
use App\Models\WorkCategory;
use App\Settings\GeneralSettings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Works out the {@see SeoPage} for the request being answered.
 *
 * The route name says which page it is, and the models the route has already
 * bound (a category, a project, a curtain work) supply its own words and
 * photos — so a project is titled and described as that project, not as "a
 * project", without a single controller having to know about SEO.
 */
final class PageResolver
{
    /** About as much of a title as Google prints. */
    private const int TITLE_LENGTH = 60;

    /** A description is cut to about what Google prints under a result. */
    private const int DESCRIPTION_LENGTH = 158;

    /** How many photos of a piece are offered to the graph and the sitemap. */
    private const int IMAGE_LIMIT = 10;

    /** How many rows a listing contributes to the graph and the crawlable outline. */
    private const int LIST_LIMIT = 30;

    public function __construct(private readonly GeneralSettings $settings) {}

    public function resolve(Request $request): SeoPage
    {
        return match ($request->route()?->getName()) {
            'home' => $this->home(),
            'about' => $this->about(),
            'work.index' => $this->workIndex(),
            'work.show' => $this->workCategory($this->bound($request, 'category', WorkCategory::class)),
            'work.project' => $this->workProject(
                $this->bound($request, 'category', WorkCategory::class),
                $this->bound($request, 'project', Project::class),
            ),
            'curtains' => $this->curtains(),
            'curtains.styles' => $this->curtainStyles(),
            'curtains.works' => $this->curtainWorks(),
            'curtains.work' => $this->curtainWork($this->bound($request, 'work', CurtainWork::class)),
            'bayte' => $this->bayte($request),
            'living-edit' => $this->livingEdit(),
            'contact' => $this->contact(),
            'privacy' => $this->legal('Privacy Policy', 'privacy', 'How Home Fashion Jamaleddine collects, uses and protects the information you share with the studio.'),
            'terms' => $this->legal('Terms of Use', 'terms', 'The terms that govern your use of the HFJE website and the studio\'s online tools.'),
            default => $this->fallback($request),
        };
    }

    private function home(): SeoPage
    {
        return new SeoPage(
            title: 'HFJE | Interior Design, Curtains & Furniture in Lebanon',
            description: Studio::DESCRIPTION,
            canonical: route('home'),
            breadcrumbs: [$this->crumb('Home', route('home'))],
            outline: [
                $this->section('What we do', [
                    ['label' => 'Interior design and furnishing', 'url' => route('work.index'), 'text' => 'Homes, apartments, restaurants and commercial spaces, furnished and dressed from the first sketch to the last cushion.'],
                    ['label' => 'Curtains & textiles', 'url' => route('curtains'), 'text' => 'Made-to-measure curtains, from fabric selection and measurement to tailoring and installation.'],
                    ['label' => 'BAYTÉ furniture', 'url' => route('bayte'), 'text' => 'A curated collection of ready-to-purchase furniture designed for modern Lebanese homes.'],
                    ['label' => 'The Living Edit', 'url' => route('living-edit'), 'text' => 'Choose the feelings, moments and materials that feel like home, and get a mood board curated by HFJE.'],
                ]),
            ],
        );
    }

    private function about(): SeoPage
    {
        return new SeoPage(
            title: Studio::title('About Us: A Family Interior Studio Since 1999'),
            description: 'A family studio working across interiors, curtains and furniture since 1999. '
                .'For '.Studio::years().' years HFJE has turned houses into homes across Lebanon.',
            canonical: route('about'),
            schemaType: 'AboutPage',
            breadcrumbs: $this->trail(['About' => route('about')]),
            outline: [
                $this->section('How we work', [
                    ['label' => 'Listen', 'text' => 'We start in the room itself, with the people who live in it and the way they use it.'],
                    ['label' => 'Measure', 'text' => 'Precise measurements on site, so every piece is cut for its room, not for a catalogue.'],
                    ['label' => 'Select', 'text' => 'Fabrics, finishes and materials chosen together, for their weight, their fall and the light.'],
                    ['label' => 'Craft', 'text' => 'Tailoring, upholstery and furniture made with the care of decades of practice.'],
                    ['label' => 'Install', 'text' => 'Our team fits everything in place and hands over a finished room.'],
                ]),
            ],
        );
    }

    private function workIndex(): SeoPage
    {
        $categories = WorkCategory::query()
            ->has('projects')
            ->withCount('projects')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $names = $categories->pluck('name')->map(fn (string $name): string => Str::lower($name))->all();

        return new SeoPage(
            title: Studio::title('Our Work: Interior Design Projects in Lebanon'),
            description: $this->limit('Explore HFJE interior projects across Lebanon'
                .($names === [] ? '' : ': '.$this->sentenceList($names))
                .'. Every space is designed and furnished around the family who lives in it.'),
            canonical: route('work.index'),
            schemaType: 'CollectionPage',
            breadcrumbs: $this->trail(['Work' => route('work.index')]),
            images: $categories->map(fn (WorkCategory $category): string => $category->imageUrl('webp'))->all(),
            nodes: [$this->itemList(route('work.index'), $categories->map(fn (WorkCategory $category): array => [
                'name' => $category->name,
                'url' => route('work.show', $category),
            ])->all())],
            outline: [$this->section('Kinds of spaces', $categories->map(fn (WorkCategory $category): array => [
                'label' => $category->name,
                'url' => route('work.show', $category),
                'text' => $category->description,
            ])->all())],
        );
    }

    private function workCategory(WorkCategory $category): SeoPage
    {
        $projects = $category->projects()
            ->with('media')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->limit(self::LIST_LIMIT)
            ->get();

        $url = route('work.show', $category);

        return new SeoPage(
            title: Studio::title($category->name.': Interior Design Projects'),
            description: $this->limit(filled($category->description)
                ? $category->description.' '.Str::ucfirst(Str::lower($category->name)).' designed and furnished by HFJE across Lebanon.'
                : Str::ucfirst(Str::lower($category->name)).' designed and furnished by HFJE across Lebanon, each one shaped around the people who use it.'),
            canonical: $url,
            schemaType: 'CollectionPage',
            breadcrumbs: $this->trail(['Work' => route('work.index'), $category->name => $url]),
            images: [$category->imageUrl('webp'), ...$projects->map(fn (Project $project): string => $project->coverUrl('webp'))->all()],
            nodes: [$this->itemList($url, $projects->map(fn (Project $project): array => [
                'name' => $project->name,
                'url' => route('work.project', [$category, $project]),
            ])->all())],
            outline: [$this->section($category->name.' projects', $projects->map(fn (Project $project): array => [
                'label' => $this->pieceLabel($project->name, $project->location, $project->year),
                'url' => route('work.project', [$category, $project]),
                'text' => $project->summary,
            ])->all())],
        );
    }

    private function workProject(WorkCategory $category, Project $project): SeoPage
    {
        $url = route('work.project', [$category, $project]);

        return $this->piece(
            name: $project->name,
            location: $project->location,
            year: $project->year,
            summary: $project->summary,
            story: $project->description,
            images: $this->pieceImages($project),
            url: $url,
            kind: $category->name,
            titleSuffix: 'Interior Design',
            fallbackDescription: 'A '.Str::lower(Str::singular($category->name)).' project designed and furnished by HFJE',
            breadcrumbs: $this->trail([
                'Work' => route('work.index'),
                $category->name => route('work.show', $category),
                $project->name => $url,
            ]),
            dateModified: $project->updated_at?->toAtomString(),
        );
    }

    private function curtains(): SeoPage
    {
        $styles = CurtainStyle::query()->shown()->with('media')->get();

        return new SeoPage(
            title: Studio::title('Custom Curtains & Textiles in Lebanon'),
            description: $this->limit('Made-to-measure curtains by HFJE: fabric selection, precise measurements, tailoring and installation'
                .($styles->isEmpty() ? '' : ', in '.$this->sentenceList($styles->pluck('name')->map(fn (string $name): string => Str::lower($name))->take(4)->all()))
                .'.'),
            canonical: route('curtains'),
            schemaType: 'CollectionPage',
            breadcrumbs: $this->trail(['Curtains & Textiles' => route('curtains')]),
            images: $styles->map(fn (CurtainStyle $style): string => $style->imageUrl())->filter()->values()->all(),
            nodes: [$this->curtainService($styles->all())],
            outline: [
                $this->section('Shaping light, completing spaces', [
                    ['label' => 'Curtains define more than privacy', 'text' => 'They shape the light, soften the architecture, and complete the atmosphere of a room.'],
                ]),
                $this->section('Designed for every window', $styles->map(fn (CurtainStyle $style): array => [
                    'label' => $style->name,
                    'url' => route('curtains.styles'),
                    'text' => $style->description,
                ])->all()),
                $this->section('Curtain projects', [['label' => 'See our curtain work', 'url' => route('curtains.works')]]),
            ],
            keywords: 'custom curtains Lebanon, curtains Beirut, blackout curtains, sheer curtains, curtain installation, '.Studio::KEYWORDS,
        );
    }

    private function curtainStyles(): SeoPage
    {
        $styles = CurtainStyle::query()->shown()->with('media')->get();

        return new SeoPage(
            title: Studio::title('Curtain Styles: Sheer, Blackout, Pleated & More'),
            description: $this->limit('Every curtain style HFJE makes, from soft sheers to complete light control'
                .($styles->isEmpty() ? '' : ': '.$this->sentenceList($styles->pluck('name')->map(fn (string $name): string => Str::lower($name))->all()))
                .'. Tailored and installed across Lebanon.'),
            canonical: route('curtains.styles'),
            schemaType: 'CollectionPage',
            breadcrumbs: $this->trail(['Curtains & Textiles' => route('curtains'), 'Styles' => route('curtains.styles')]),
            images: $styles->map(fn (CurtainStyle $style): string => $style->imageUrl())->filter()->values()->all(),
            nodes: [$this->curtainService($styles->all())],
            outline: [$this->section('Curtain styles', $styles->map(fn (CurtainStyle $style): array => [
                'label' => $style->name,
                'text' => $style->description,
            ])->all())],
            keywords: 'curtain styles, sheer curtains, blackout curtains, pleated curtains, eyelet curtains, '.Studio::KEYWORDS,
        );
    }

    private function curtainWorks(): SeoPage
    {
        $works = CurtainWork::query()->with('media')->orderBy('sort_order')->orderBy('id')->limit(self::LIST_LIMIT)->get();

        return new SeoPage(
            title: Studio::title('Curtain Projects: Made-to-Measure Work'),
            description: 'Curtains cut, tailored and fitted by HFJE for the rooms they belong to, in homes and spaces across Lebanon.',
            canonical: route('curtains.works'),
            schemaType: 'CollectionPage',
            breadcrumbs: $this->trail(['Curtains & Textiles' => route('curtains'), 'Projects' => route('curtains.works')]),
            images: $works->map(fn (CurtainWork $work): string => $work->coverUrl('webp'))->all(),
            nodes: [$this->itemList(route('curtains.works'), $works->map(fn (CurtainWork $work): array => [
                'name' => $work->name,
                'url' => route('curtains.work', $work),
            ])->all())],
            outline: [$this->section('Curtain projects', $works->map(fn (CurtainWork $work): array => [
                'label' => $this->pieceLabel($work->name, $work->location, $work->year),
                'url' => route('curtains.work', $work),
                'text' => $work->summary,
            ])->all())],
        );
    }

    private function curtainWork(CurtainWork $work): SeoPage
    {
        $url = route('curtains.work', $work);

        return $this->piece(
            name: $work->name,
            location: $work->location,
            year: $work->year,
            summary: $work->summary,
            story: $work->description,
            images: $this->pieceImages($work),
            url: $url,
            kind: 'Curtains & Textiles',
            titleSuffix: 'Custom Curtains',
            fallbackDescription: 'Made-to-measure curtains tailored and installed by HFJE',
            breadcrumbs: $this->trail([
                'Curtains & Textiles' => route('curtains'),
                'Projects' => route('curtains.works'),
                $work->name => $url,
            ]),
            dateModified: $work->updated_at?->toAtomString(),
        );
    }

    /**
     * The BAYTÉ catalogue. A category is a real shelf worth its own result,
     * so `?category=` stays in its canonical; a search is a visitor's own
     * query, followed but never indexed.
     */
    private function bayte(Request $request): SeoPage
    {
        $category = BayteCategory::query()
            ->has('products')
            ->where('slug', (string) $request->query('category'))
            ->first();

        $products = BayteProduct::query()
            ->when($category, fn ($query) => $query->where('bayte_category_id', $category->id))
            ->with('media')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->limit(self::LIST_LIMIT)
            ->get();

        $categories = BayteCategory::query()->has('products')->orderBy('sort_order')->orderBy('id')->get();
        $canonical = $category ? route('bayte', ['category' => $category->slug]) : route('bayte');
        $searching = filled($request->query('search'));

        return new SeoPage(
            title: $category
                ? Studio::title($category->name.' | BAYTÉ Furniture')
                : 'BAYTÉ by HFJE | Furniture for Modern Lebanese Homes',
            description: $category
                ? $this->limit($category->name.' from BAYTÉ by HFJE: ready-to-purchase pieces designed for modern Lebanese homes, with lasting materials and the craftsmanship of HFJE.')
                : 'A curated collection of ready-to-purchase furniture for modern Lebanese homes. Every BAYTÉ piece solves a real living need with lasting materials and HFJE craftsmanship.',
            canonical: $canonical,
            schemaType: 'CollectionPage',
            indexable: ! $searching,
            breadcrumbs: $this->trail(array_filter([
                'BAYTÉ' => route('bayte'),
                ...($category ? [$category->name => $canonical] : []),
            ])),
            images: $products->map(fn (BayteProduct $product): string => $product->imageUrl())->all(),
            nodes: [[
                '@type' => 'Brand',
                '@id' => route('bayte').'#brand',
                'name' => 'BAYTÉ',
                'alternateName' => 'BAYTÉ by HFJE',
                'slogan' => 'Fewer Pieces. Better Living.',
                'description' => 'Ready-to-purchase furniture designed for modern Lebanese homes.',
                'url' => route('bayte'),
                'logo' => asset('logos/bayte.svg'),
            ]],
            outline: [
                $this->section('Shelves', $categories->map(fn (BayteCategory $item): array => [
                    'label' => $item->name,
                    'url' => route('bayte', ['category' => $item->slug]),
                ])->all()),
                $this->section($category ? $category->name : 'The collection', $products->map(fn (BayteProduct $product): array => [
                    'label' => $product->name,
                    'text' => $product->description,
                ])->all()),
            ],
            keywords: 'BAYTÉ, BAYTE furniture, furniture Lebanon, sofas Lebanon, ready made furniture Beirut, أثاث لبنان, كنب, '.Studio::KEYWORDS,
        );
    }

    private function livingEdit(): SeoPage
    {
        return new SeoPage(
            title: Studio::title('The Living Edit: Build Your Interior Mood Board'),
            description: 'Choose the feelings, moments and materials that feel like home. Your selections are matched with visual directions curated by HFJE, as a mood board you can save.',
            canonical: route('living-edit'),
            breadcrumbs: $this->trail(['The Living Edit' => route('living-edit')]),
            nodes: [[
                '@type' => 'WebApplication',
                '@id' => route('living-edit').'#app',
                'name' => 'The Living Edit',
                'url' => route('living-edit'),
                'applicationCategory' => 'DesignApplication',
                'operatingSystem' => 'Any',
                'browserRequirements' => 'Requires JavaScript',
                'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'USD'],
                'creator' => ['@id' => route('home').'#organization'],
            ]],
            outline: [$this->section('How it works', [
                ['label' => 'Choose your space', 'text' => 'Living room, kitchen, bedroom or dining room.'],
                ['label' => 'Pick what feels like home', 'text' => 'Four short steps: the feelings, the moments, the materials and the palette.'],
                ['label' => 'See your mood board', 'text' => 'Your picks are matched with visual directions curated by HFJE, ready to save or to bring to a consultation.'],
            ])],
        );
    }

    private function contact(): SeoPage
    {
        $phone = $this->settings->usablePhoneNumber();
        $email = filled($this->settings->email) ? $this->settings->email : null;

        return new SeoPage(
            title: Studio::title('Contact Us: Start Your Interior Project'),
            description: 'Tell HFJE about the space you want to transform: a room, a whole home, curtains or just an idea. We reply within two working days.',
            canonical: route('contact'),
            schemaType: 'ContactPage',
            breadcrumbs: $this->trail(['Contact' => route('contact')]),
            outline: [$this->section('Reach the studio', array_values(array_filter([
                $phone ? ['label' => 'Call '.$phone, 'url' => 'tel:'.preg_replace('/[^\d+]/', '', $phone)] : null,
                $email ? ['label' => 'Email '.$email, 'url' => 'mailto:'.$email] : null,
                ['label' => 'Send a message', 'text' => 'Use the form on this page and we reply within two working days.'],
            ])))],
        );
    }

    private function legal(string $name, string $routeName, string $description): SeoPage
    {
        return new SeoPage(
            title: Studio::title($name),
            description: $description,
            canonical: route($routeName),
            breadcrumbs: $this->trail([$name => route($routeName)]),
        );
    }

    /**
     * Any page without copy of its own: described as the studio, but never
     * claiming another page's URL as its canonical.
     */
    private function fallback(Request $request): SeoPage
    {
        return new SeoPage(
            title: Studio::title(Studio::SLOGAN),
            description: Studio::DESCRIPTION,
            canonical: url()->to($request->path()),
            breadcrumbs: [$this->crumb('Home', route('home'))],
        );
    }

    /**
     * A finished piece of the portfolio, as its own page: titled with its name
     * and place, described by its summary (or story), and marked up as a
     * creative work by the studio with every photo of it.
     *
     * @param  list<string>  $images
     * @param  list<array{name: string, url: string}>  $breadcrumbs
     */
    private function piece(
        string $name,
        ?string $location,
        ?int $year,
        ?string $summary,
        ?string $story,
        array $images,
        string $url,
        string $kind,
        string $titleSuffix,
        string $fallbackDescription,
        array $breadcrumbs,
        ?string $dateModified,
    ): SeoPage {
        $storyText = $this->plainText($story);
        $place = filled($location) ? $location.', Lebanon' : 'Lebanon';

        $description = filled($summary)
            ? $summary
            : ($storyText !== '' ? $storyText : $fallbackDescription.' in '.$place.'.');

        // The place joins the name only when the name doesn't already say it
        // and the whole title still fits what Google prints of it.
        $withPlace = $name.', '.$location;
        $title = filled($location)
            && ! Str::contains(Str::lower($name), Str::lower((string) $location))
            && Str::length(Studio::title($withPlace.' | '.$titleSuffix)) <= self::TITLE_LENGTH
                ? $withPlace
                : $name;

        return new SeoPage(
            title: Studio::title($title.' | '.$titleSuffix),
            description: $this->limit($description),
            canonical: $url,
            schemaType: 'ItemPage',
            openGraphType: 'article',
            breadcrumbs: $breadcrumbs,
            images: $images,
            nodes: [array_filter([
                '@type' => 'CreativeWork',
                '@id' => $url.'#work',
                'name' => $name,
                'headline' => $name,
                'description' => $this->limit($description, 300),
                'text' => $storyText !== '' ? $storyText : null,
                'genre' => $kind,
                'url' => $url,
                'image' => $images,
                'dateCreated' => $year ? (string) $year : null,
                'dateModified' => $dateModified,
                'locationCreated' => [
                    '@type' => 'Place',
                    'name' => $place,
                    'address' => array_filter([
                        '@type' => 'PostalAddress',
                        'addressLocality' => $location,
                        'addressCountry' => Studio::COUNTRY,
                    ]),
                ],
                'creator' => ['@id' => route('home').'#organization'],
                'publisher' => ['@id' => route('home').'#organization'],
                'mainEntityOfPage' => ['@id' => $url.'#webpage'],
            ], fn (mixed $value): bool => $value !== null && $value !== [])],
            outline: [$this->section($name, array_values(array_filter([
                ['label' => $this->pieceLabel($kind, $location, $year)],
                filled($summary) ? ['label' => 'Summary', 'text' => $summary] : null,
                $storyText !== '' ? ['label' => 'The story', 'text' => $storyText] : null,
            ])))],
            mainEntityId: $url.'#work',
        );
    }

    /**
     * The cover then the gallery of a piece, in their dashboard order.
     *
     * @return list<string>
     */
    private function pieceImages(CurtainWork|Project $piece): array
    {
        $gallery = array_column($piece->galleryImages(), 'src');

        return array_values(array_unique(array_slice([$piece->coverUrl('webp'), ...$gallery], 0, self::IMAGE_LIMIT)));
    }

    /**
     * The curtain service the studio offers, with each style as an offer in
     * its catalogue — what a search for "blackout curtains Lebanon" matches.
     *
     * @param  list<CurtainStyle>  $styles
     * @return array<string, mixed>
     */
    private function curtainService(array $styles): array
    {
        return array_filter([
            '@type' => 'Service',
            '@id' => route('curtains').'#service',
            'name' => 'Made-to-measure curtains & textiles',
            'serviceType' => 'Custom curtains',
            'description' => 'Fabric selection, precise measurements, tailoring and installation of curtains designed around the light, proportions and character of each space.',
            'url' => route('curtains'),
            'provider' => ['@id' => route('home').'#organization'],
            'areaServed' => ['@type' => 'Country', 'name' => Studio::COUNTRY_NAME],
            'hasOfferCatalog' => $styles === [] ? null : [
                '@type' => 'OfferCatalog',
                'name' => 'Curtain styles',
                'itemListElement' => array_map(fn (CurtainStyle $style): array => [
                    '@type' => 'Offer',
                    'itemOffered' => array_filter([
                        '@type' => 'Service',
                        'name' => $style->name,
                        'description' => $style->description,
                        'image' => $style->imageUrl() ?: null,
                    ]),
                ], $styles),
            ],
        ], fn (mixed $value): bool => $value !== null);
    }

    /**
     * An ordered list of the pages a listing links to.
     *
     * @param  list<array{name: string, url: string}>  $items
     * @return array<string, mixed>
     */
    private function itemList(string $pageUrl, array $items): array
    {
        return [
            '@type' => 'ItemList',
            '@id' => $pageUrl.'#list',
            'numberOfItems' => count($items),
            'itemListElement' => array_map(fn (array $item, int $index): array => [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $item['name'],
                'url' => $item['url'],
            ], $items, array_keys($items)),
        ];
    }

    /**
     * Home, then each named page in turn.
     *
     * @param  array<string, string>  $pages
     * @return list<array{name: string, url: string}>
     */
    private function trail(array $pages): array
    {
        $trail = [$this->crumb('Home', route('home'))];

        foreach ($pages as $name => $url) {
            $trail[] = $this->crumb((string) $name, $url);
        }

        return $trail;
    }

    /** @return array{name: string, url: string} */
    private function crumb(string $name, string $url): array
    {
        return ['name' => $name, 'url' => $url];
    }

    /**
     * @param  list<array{label: string, url?: string|null, text?: string|null}>  $items
     * @return array{heading: string, items: list<array{label: string, url?: string|null, text?: string|null}>}
     */
    private function section(string $heading, array $items): array
    {
        return ['heading' => $heading, 'items' => array_values($items)];
    }

    /** "Name, Place, 2024", leaving out whatever is unknown. */
    private function pieceLabel(string $name, ?string $location, ?int $year): string
    {
        return implode(', ', array_filter([$name, $location, $year ? (string) $year : null]));
    }

    /** The rich-text story as one line of plain text. */
    private function plainText(?string $html): string
    {
        if (blank($html)) {
            return '';
        }

        $text = html_entity_decode(strip_tags(str_replace(['</p>', '<br>', '<br/>', '<br />', '</li>'], ' ', $html)), ENT_QUOTES | ENT_HTML5);

        return trim((string) preg_replace('/\s+/u', ' ', $text));
    }

    /** Cut at a word, so a description never ends mid-word. */
    private function limit(string $text, int $length = self::DESCRIPTION_LENGTH): string
    {
        $text = trim((string) preg_replace('/\s+/u', ' ', $text));

        return Str::length($text) <= $length ? $text : Str::limit($text, $length - 1, '…', preserveWords: true);
    }

    /**
     * "a, b and c".
     *
     * @param  list<string>  $items
     */
    private function sentenceList(array $items): string
    {
        $items = array_values($items);

        if (count($items) < 2) {
            return $items[0] ?? '';
        }

        return implode(', ', array_slice($items, 0, -1)).' and '.end($items);
    }

    /**
     * The model the route bound under this name.
     *
     * @template TModel of Model
     *
     * @param  class-string<TModel>  $class
     * @return TModel
     */
    private function bound(Request $request, string $name, string $class): Model
    {
        $model = $request->route($name);

        return $model instanceof $class ? $model : $class::query()->where('slug', (string) $model)->firstOrFail();
    }
}
