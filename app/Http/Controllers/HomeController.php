<?php

namespace App\Http\Controllers;

use App\Models\BayteProduct;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * The home page, with the BAYTE pieces picked for it in the dashboard.
     */
    public function __invoke(): Response
    {
        return Inertia::render('home/index', [
            'bayteProducts' => BayteProduct::forHome()
                ->map(fn (BayteProduct $product): array => [
                    'slug' => $product->slug,
                    'name' => $product->name,
                    'description' => $product->description,
                    'image' => $product->imageUrl(),
                ])
                ->all(),
        ]);
    }
}
