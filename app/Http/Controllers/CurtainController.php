<?php

namespace App\Http\Controllers;

use App\Models\CurtainStyle;
use Inertia\Inertia;
use Inertia\Response;

class CurtainController extends Controller
{
    /** Styles the page's section holds; the rest wait on the styles page. */
    private const PREVIEW_STYLES = 8;

    /**
     * The curtains page, with the first few active styles.
     */
    public function index(): Response
    {
        return Inertia::render('curtains/index', [
            'styles' => $this->present(
                CurtainStyle::query()->shown()->with('media')->limit(self::PREVIEW_STYLES)->get(),
            ),
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
