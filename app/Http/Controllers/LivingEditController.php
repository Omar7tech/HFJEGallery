<?php

namespace App\Http\Controllers;

use App\Http\Resources\LivingSpaceResource;
use App\Http\Resources\StepFourResource;
use App\Http\Resources\StepOneResource;
use App\Http\Resources\StepThreeResource;
use App\Http\Resources\StepTwoResource;
use App\Models\LivingSpace;
use App\Models\StepFour;
use App\Models\StepOne;
use App\Models\StepThree;
use App\Models\StepTwo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Inertia\Inertia;
use Inertia\Response;

class LivingEditController extends Controller
{
    /**
     * Show the Living Edit with its active spaces and the active options of each step.
     */
    public function __invoke(): Response
    {
        return Inertia::render('living-edit/index', [
            'spaces' => LivingSpaceResource::collection($this->activeRecords(LivingSpace::query()))->resolve(),
            'stepOne' => StepOneResource::collection($this->activeRecords(StepOne::query()))->resolve(),
            'stepTwo' => StepTwoResource::collection($this->activeRecords(StepTwo::query()))->resolve(),
            'stepThree' => StepThreeResource::collection($this->activeRecords(StepThree::query()))->resolve(),
            'stepFour' => StepFourResource::collection($this->activeRecords(StepFour::query()))->resolve(),
        ]);
    }

    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @return Collection<int, TModel>
     */
    private function activeRecords(Builder $query): Collection
    {
        return $query
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->with('media')
            ->get();
    }
}
