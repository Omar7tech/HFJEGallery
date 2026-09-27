<?php

namespace App\Http\Controllers;

use App\Http\Resources\LivingSpaceResource;
use App\Models\BayteProduct;
use App\Models\LivingSpace;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * The home page, with the BAYTE pieces picked for it in the dashboard and
     * the spaces the Living Edit starts from.
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
            // The first step of the Living Edit, offered on the home page.
            'livingSpaces' => LivingSpaceResource::collection(LivingSpace::query()->offered()->get())->resolve(),
        ]);
    }
}
