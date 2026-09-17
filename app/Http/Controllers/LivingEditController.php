<?php

namespace App\Http\Controllers;

use App\Http\Resources\LivingSpaceResource;
use App\Http\Resources\StepOneResource;
use App\Http\Resources\StepTwoResource;
use App\Models\LivingSpace;
use App\Models\StepOne;
use App\Models\StepTwo;
use Inertia\Inertia;
use Inertia\Response;

class LivingEditController extends Controller
{
    /**
     * Show the Living Edit with its active spaces, step 1 options and step 2 options.
     */
    public function __invoke(): Response
    {
        $spaces = LivingSpace::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->with('media')
            ->get();

        $stepOneOptions = StepOne::query()
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
            'stepOne' => StepOneResource::collection($stepOneOptions)->resolve(),
            'stepTwo' => StepTwoResource::collection($stepTwoOptions)->resolve(),
        ]);
    }
}
