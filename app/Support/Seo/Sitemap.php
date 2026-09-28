<?php

namespace App\Support\Seo;

use App\Models\BayteCategory;
use App\Models\BayteProduct;
use App\Models\CurtainStyle;
use App\Models\CurtainWork;
use App\Models\Project;
use App\Models\WorkCategory;
use DateTimeInterface;
use Illuminate\Support\Collection;

/**
 * Every public page a crawler should know about, with when it last changed and
 * the photographs on it, so the portfolio reaches Google Images alongside the
 * pages themselves.
 *
 * Built from the database on each request: a project published in the
 * dashboard is in the sitemap the moment it is on the site, and one taken
 * down is gone from it just as fast.
 */
final class Sitemap
{
    /** How many photos of one page are offered; Google reads up to a thousand, a page never needs that many. */
    private const int IMAGES_PER_PAGE = 20;

    /**
     * @return list<array{loc: string, lastmod: string|null, images: list<string>}>
     */
    public function entries(): array
    {
        $categories = WorkCategory::query()->has('projects')->with('media')->orderBy('sort_order')->orderBy('id')->get();
        $projects = Project::query()->with(['media', 'category'])->orderBy('sort_order')->orderBy('id')->get();
        $works = CurtainWork::query()->with('media')->orderBy('sort_order')->orderBy('id')->get();
        $styles = CurtainStyle::query()->shown()->with('media')->get();
        $shelves = BayteCategory::query()->has('products')->orderBy('sort_order')->orderBy('id')->get();

        $latestProject = $this->latest($projects);
        $latestWork = $this->latest($works);
        $latestStyle = $this->latest($styles);
        $latestProduct = $this->date(BayteProduct::query()->max('updated_at'));

        return [
            $this->entry(route('home'), $this->newest([$latestProject, $latestWork, $latestProduct]), [asset(Studio::IMAGE)]),
            $this->entry(route('about')),
            $this->entry(route('work.index'), $latestProject, $categories
                ->map(fn (WorkCategory $category): string => $category->imageUrl('webp'))
                ->all()),
            ...$categories->map(fn (WorkCategory $category): array => $this->entry(
                route('work.show', $category),
                $this->latest($projects->where('work_category_id', $category->id)),
                [$category->imageUrl('webp')],
            ))->all(),
            ...$projects
                ->filter(fn (Project $project): bool => $project->category !== null)
                ->map(fn (Project $project): array => $this->entry(
                    route('work.project', [$project->category, $project]),
                    $this->date($project->updated_at),
                    $this->pieceImages($project),
                ))->all(),
            $this->entry(route('curtains'), $this->newest([$latestStyle, $latestWork]), $styles
                ->map(fn (CurtainStyle $style): string => $style->imageUrl())
                ->filter()
                ->all()),
            $this->entry(route('curtains.styles'), $latestStyle),
            $this->entry(route('curtains.works'), $latestWork),
            ...$works->map(fn (CurtainWork $work): array => $this->entry(
                route('curtains.work', $work),
                $this->date($work->updated_at),
                $this->pieceImages($work),
            ))->all(),
            $this->entry(route('bayte'), $latestProduct),
            ...$shelves->map(fn (BayteCategory $shelf): array => $this->entry(
                route('bayte', ['category' => $shelf->slug]),
                $this->date($shelf->products()->max('updated_at')),
            ))->all(),
            $this->entry(route('living-edit')),
            $this->entry(route('contact')),
            $this->entry(route('privacy')),
            $this->entry(route('terms')),
        ];
    }

    /**
     * The crawl rules: everything a visitor can see is open; the dashboard,
     * the mood board's JSON feed and Laravel's internals are not.
     *
     * The uploads under /storage are deliberately left open — they are the
     * project photographs Google Images should index.
     *
     * @return list<string>
     */
    public function robots(): array
    {
        return [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',
            'Disallow: /livewire',
            'Disallow: /living-edit/mood-board',
            'Disallow: /up',
            'Disallow: /*?search=',
            'Disallow: /*&search=',
            '',
            // Crawlers that hammer a small shared host for nothing in return.
            'User-agent: AhrefsBot',
            'Crawl-delay: 10',
            '',
            'User-agent: SemrushBot',
            'Crawl-delay: 10',
            '',
            'User-agent: MJ12bot',
            'Crawl-delay: 10',
            '',
            'Sitemap: '.route('seo.sitemap'),
            '',
        ];
    }

    /**
     * @param  array<int, string>  $images
     * @return array{loc: string, lastmod: string|null, images: list<string>}
     */
    private function entry(string $loc, ?string $lastmod = null, array $images = []): array
    {
        return [
            'loc' => $loc,
            'lastmod' => $lastmod,
            'images' => array_slice(array_values(array_unique($images)), 0, self::IMAGES_PER_PAGE),
        ];
    }

    /**
     * The cover and gallery of a piece.
     *
     * @return list<string>
     */
    private function pieceImages(CurtainWork|Project $piece): array
    {
        return [$piece->coverUrl('webp'), ...array_column($piece->galleryImages(), 'src')];
    }

    /** @param Collection<int, covariant \Illuminate\Database\Eloquent\Model> $models */
    private function latest(Collection $models): ?string
    {
        return $this->date($models->max('updated_at'));
    }

    /** @param list<string|null> $dates */
    private function newest(array $dates): ?string
    {
        $dates = array_filter($dates);

        return $dates === [] ? null : max($dates);
    }

    private function date(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return $value instanceof DateTimeInterface
            ? $value->format(DATE_ATOM)
            : now()->parse((string) $value)->toAtomString();
    }
}
