<?php

namespace App\Http\Controllers;

use App\Models\BayteCategory;
use App\Models\BayteProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BayteController extends Controller
{
    /** Fills the three-column grid exactly. */
    private const PER_PAGE = 9;

    /**
     * One category of the BAYTE collection, loaded nine pieces at a time.
     */
    public function __invoke(Request $request): Response
    {
        // An empty shelf has nothing to show, so it never becomes a pill.
        // Ties in the dashboard order fall back to the order the categories
        // were added, so the first pill never changes shape on its own.
        $categories = BayteCategory::query()
            ->has('products')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'slug', 'name']);

        // No category in the URL, or one that is unknown or empty, opens the
        // first shelf.
        $active = $categories->firstWhere('slug', $request->query('category'))
            ?? $categories->first();

        $products = fn () => BayteProduct::query()
            ->where('bayte_category_id', $active?->id);

        // Closures throughout: a filter tap or "Load more" is a partial reload
        // asking for the pieces alone, so nothing else is built for it.
        return Inertia::render('bayte/index', [
            'categories' => fn (): array => $categories
                ->map(fn (BayteCategory $category): array => [
                    'slug' => $category->slug,
                    'name' => $category->name,
                ])
                ->all(),
            'activeCategory' => $active?->slug,
            'total' => fn (): int => $products()->count(),
            'products' => Inertia::scroll(fn () => $products()
                ->with('media')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->paginate(self::PER_PAGE)
                ->withQueryString()
                ->through(fn (BayteProduct $product): array => [
                    'slug' => $product->slug,
                    'name' => $product->name,
                    'description' => $product->description,
                    'image' => $product->imageUrl(),
                ])),
        ]);
    }
}
