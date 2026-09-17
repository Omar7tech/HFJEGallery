<?php

namespace App\Http\Controllers;

use App\Enums\LivingEditStep;
use App\Http\Requests\MoodBoardRequest;
use App\Http\Resources\MoodBoardImageResource;
use App\Models\GalleryImage;
use App\Models\LivingSpace;
use App\Services\MoodBoardBuilder;
use Illuminate\Http\JsonResponse;

class MoodBoardController extends Controller
{
    /**
     * The mood board images for a visitor's space and Living Edit choices.
     */
    public function __invoke(MoodBoardRequest $request, MoodBoardBuilder $builder): JsonResponse
    {
        $space = LivingSpace::query()
            ->where('is_active', true)
            ->where('slug', $request->validated('space'))
            ->firstOrFail();

        $selectedSlugsByStep = collect(LivingEditStep::cases())
            ->mapWithKeys(fn (LivingEditStep $step): array => [$step->value => $request->selectedSlugs($step)])
            ->all();

        $board = $builder->build($space, $selectedSlugsByStep, $request->seed(), $request->keptImageIds());

        return response()->json([
            'slots' => collect($board)
                ->map(fn (?GalleryImage $image, int $slot): array => [
                    'slot' => $slot,
                    'image' => $image ? MoodBoardImageResource::make($image)->resolve($request) : null,
                ])
                ->values(),
        ])->header('Cache-Control', 'private, max-age=60');
    }
}
