<?php

namespace App\Http\Controllers;

use App\Enums\LivingEditStep;
use App\Http\Resources\LivingEditOptionResource;
use App\Http\Resources\LivingSpaceResource;
use App\Models\LivingEditOption;
use App\Models\LivingSpace;
use Inertia\Inertia;
use Inertia\Response;

class LivingEditController extends Controller
{
    /**
     * Show the Living Edit with its active spaces and the active options of every step.
     */
    public function __invoke(): Response
    {
        $spaces = LivingSpace::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->with('media')
            ->get();

        $optionsByStep = LivingEditOption::query()
            ->where('is_active', true)
            ->orderBy('step')
            ->orderBy('sort_order')
            ->with('media')
            ->get()
            ->groupBy(fn (LivingEditOption $option): int => $option->step->value);

        $steps = collect(LivingEditStep::cases())->mapWithKeys(fn (LivingEditStep $step): array => [
            $step->key() => LivingEditOptionResource::collection($optionsByStep->get($step->value, []))->resolve(),
        ]);

        return Inertia::render('living-edit/index', [
            'spaces' => LivingSpaceResource::collection($spaces)->resolve(),
            'steps' => $steps,
        ]);
    }
}
