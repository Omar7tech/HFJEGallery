<?php

namespace App\Http\Controllers;

use App\Models\BayteCategory;
use App\Models\BayteProduct;
use App\Settings\GeneralSettings;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BayteController extends Controller
{
    /** Fills the three-column grid exactly. */
    private const PER_PAGE = 9;

    /**
     * The BAYTE catalogue, loaded nine pieces at a time: every piece, or one
     * category (`?category=sofas`), optionally narrowed by a search
     * (`?search=oak`) on the name and description. Visitors collect pieces
     * into a selection kept in their browser and send it to the studio's
     * WhatsApp to ask about them.
     */
    public function __invoke(Request $request, GeneralSettings $settings): Response
    {
        // An empty shelf has nothing to show, so it is never offered. Ties in
        // the dashboard order fall back to the order the categories were added.
        $categories = BayteCategory::query()
            ->has('products')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'slug', 'name']);

        // No category in the URL, or one that is unknown or empty, shows the
        // whole collection.
        $active = $categories->firstWhere('slug', $request->query('category'));
        $search = $request->string('search')->trim()->limit(100, '')->value();

        $products = fn (): Builder => BayteProduct::query()
            ->when($active, fn (Builder $query) => $query->where('bayte_category_id', $active->id))
            ->when($search !== '', fn (Builder $query) => $query->where(fn (Builder $query) => $query
                ->whereRaw("name like ? escape '!'", [$this->contains($search)])
                ->orWhereRaw("description like ? escape '!'", [$this->contains($search)])));

        // Closures throughout: a category tap, a search or "Load more" is a
        // partial reload asking for the pieces alone, so nothing else is built.
        return Inertia::render('bayte/index', [
            'categories' => fn (): array => $categories
                ->map(fn (BayteCategory $category): array => [
                    'slug' => $category->slug,
                    'name' => $category->name,
                ])
                ->all(),
            'activeCategory' => $active?->slug,
            // Where the visitor's selection is sent; null disables sending it.
            'whatsappNumber' => fn (): ?string => $settings->whatsappDigits(),
            'search' => $search,
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

    /**
     * A LIKE pattern matching the term anywhere, with its own `%` and `_`
     * taken literally. An explicit escape character reads the same on MySQL
     * and SQLite.
     */
    private function contains(string $term): string
    {
        return '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $term).'%';
    }
}
