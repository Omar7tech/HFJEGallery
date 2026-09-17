<?php

namespace App\Http\Controllers;

use App\Http\Resources\LivingSpaceResource;
use App\Http\Resources\StepTwoResource;
use App\Models\LivingSpace;
use App\Models\StepTwo;
use Inertia\Inertia;
use Inertia\Response;

class LivingEditController extends Controller
{
    /**
     * Show the Living Edit with its active spaces and active step 2 options.
     */
    public function __invoke(): Response
    {
        $spaces = LivingSpace::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->with('media')
            ->get();

        $stepTwoOptions = StepTwo::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->with('media')
            ->get();

        return Inertia::render('living-edit/index', [
            'spaces' => LivingSpaceResource::collection($spaces)->resolve(),
            'stepTwo' => StepTwoResource::collection($stepTwoOptions)->resolve(),
        ]);
    }
}
