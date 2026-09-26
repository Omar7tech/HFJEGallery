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
     * Show one category of the BAYTE collection, paginated.
     */
    public function __invoke(Request $request): Response
    {
        $categories = BayteCategory::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        // No category in the URL — or an unknown one — opens the first shelf.
        $active = $categories->firstWhere('slug', $request->query('category'))
            ?? $categories->first();

        $products = BayteProduct::query()
            ->where('bayte_category_id', $active?->id)
            ->with('media')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('bayte/index', [
            'categories' => $categories
                ->map(fn (BayteCategory $category): array => [
                    'slug' => $category->slug,
                    'name' => $category->name,
                ])
                ->all(),
            'activeCategory' => $active?->slug,
            'products' => [
                'data' => $products->getCollection()
                    ->map(fn (BayteProduct $product): array => [
                        'slug' => $product->slug,
                        'name' => $product->name,
                        'description' => $product->description,
                        'image' => $product->imageUrl(),
                    ])
                    ->all(),
                'currentPage' => $products->currentPage(),
                'lastPage' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }
}
