<?php

namespace App\Http\Controllers;

use App\Models\CurtainStyle;
use App\Models\CurtainWork;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class CurtainController extends Controller
{
    /** Styles the page's section holds; the rest wait on the styles page. */
    private const PREVIEW_STYLES = 8;

    /** Two rows of the page's work grid; the rest wait in the portfolio. */
    private const PREVIEW_WORKS = 8;

    /** Fills the three-column portfolio grid exactly. */
    private const PER_PAGE = 9;

    /**
     * The curtains page, with the first few active styles and works.
     */
    public function index(): Response
    {
        return Inertia::render('curtains/index', [
            'styles' => $this->present(
                CurtainStyle::query()->shown()->with('media')->limit(self::PREVIEW_STYLES)->get(),
            ),
            'works' => $this->ordered(CurtainWork::query())
                ->with('media')
                ->limit(self::PREVIEW_WORKS)
                ->get()
                ->map(fn (CurtainWork $work): array => $work->toCard())
                ->all(),
            'worksCount' => CurtainWork::query()->count(),
        ]);
    }

    /**
     * Every active curtain style, as cards with their descriptions.
     */
    public function styles(): Response
    {
        return Inertia::render('curtains/styles', [
            'styles' => $this->present(CurtainStyle::query()->shown()->with('media')->get()),
        ]);
    }

    /**
     * The curtain work portfolio, loaded page by page as the visitor scrolls.
     */
    public function works(): Response
    {
        return Inertia::render('curtains/works', [
            'works' => Inertia::scroll(fn () => $this->ordered(CurtainWork::query())
                ->with('media')
                ->paginate(self::PER_PAGE)
                ->through(fn (CurtainWork $work): array => $work->toCard())),
        ]);
    }

    /**
     * One curtain work: its cover, story and gallery, with the next work.
     */
    public function work(CurtainWork $work): Response
    {
        return Inertia::render('curtains/work', [
            'work' => $work->toDetail(),
            'nextWork' => $work->nextAmong(CurtainWork::query())?->toLink(),
        ]);
    }

    /**
     * Works in their dashboard order, ties falling back to the order they were added.
     *
     * @param  Builder<CurtainWork>  $query
     * @return Builder<CurtainWork>
     */
    private function ordered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * @param  iterable<CurtainStyle>  $styles
     * @return list<array{slug: string, name: string, description: string, image: string}>
     */
    private function present(iterable $styles): array
    {
        return collect($styles)
            ->map(fn (CurtainStyle $style): array => [
                'slug' => $style->slug,
                'name' => $style->name,
                'description' => $style->description,
                'image' => $style->imageUrl(),
            ])
            ->values()
            ->all();
    }
}
