<?php

namespace App\Http\Controllers;

use App\Http\Resources\LivingSpaceResource;
use App\Models\LivingSpace;
use Illuminate\Database\Eloquent\Relations\Relation;
use Inertia\Inertia;
use Inertia\Response;

class LivingEditController extends Controller
{
    /**
     * Show the Living Edit with its active spaces and the active feelings of each.
     */
    public function __invoke(): Response
    {
        $spaces = LivingSpace::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->with([
                'media',
                'feelings' => fn (Relation $query) => $query
                    ->where('living_feelings.is_active', true)
                    ->orderBy('living_feelings.sort_order')
                    ->with('media'),
            ])
            ->get();

        return Inertia::render('living-edit/index', [
            'spaces' => LivingSpaceResource::collection($spaces)->resolve(),
        ]);
    }
}
