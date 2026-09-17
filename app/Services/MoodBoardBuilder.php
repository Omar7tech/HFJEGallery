<?php

namespace App\Services;

use App\Enums\LivingEditStep;
use App\Enums\MoodBoardImageSlot;
use App\Models\GalleryImage;
use App\Models\LivingEditOption;
use App\Models\LivingSpace;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Collection;

/**
 * Picks one gallery image for every mood board position, matching the visitor's space and choices.
 *
 * Images are ranked by how many steps they match, then by how many chosen options they carry.
 * A position always gets an image when any active one exists: when the space has none for that
 * position, the best match from any space is used instead.
 */
class MoodBoardBuilder
{
    /**
     * @param  array<int, list<string>>  $selectedSlugsByStep  option slugs keyed by step number
     * @param  list<int>  $keptImageIds  images on the current board, kept while they still rank best
     * @return array<int, GalleryImage|null> keyed by slot value, in board order
     */
    public function build(LivingSpace $space, array $selectedSlugsByStep, int $seed = 0, array $keptImageIds = []): array
    {
        $selectedOptionIds = $this->resolveOptionIds($selectedSlugsByStep);
        $slots = MoodBoardImageSlot::cases();

        $picks = $this->pickPerSlot($this->rankedCandidates($selectedOptionIds, $slots, $space), $seed, $keptImageIds);

        $missingSlots = array_values(array_filter($slots, fn (MoodBoardImageSlot $slot): bool => ! isset($picks[$slot->value])));

        if ($missingSlots !== []) {
            $picks += $this->pickPerSlot($this->rankedCandidates($selectedOptionIds, $missingSlots), $seed, $keptImageIds);
        }

        $images = GalleryImage::query()->with('media')->findMany(array_values($picks))->keyBy('id');

        return collect($slots)
            ->mapWithKeys(fn (MoodBoardImageSlot $slot): array => [
                $slot->value => isset($picks[$slot->value]) ? $images->get($picks[$slot->value]) : null,
            ])
            ->all();
    }

    /**
     * Active option ids for the chosen slugs, each looked up within its own step.
     *
     * @param  array<int, list<string>>  $selectedSlugsByStep
     * @return list<int>
     */
    private function resolveOptionIds(array $selectedSlugsByStep): array
    {
        $selectedSlugsByStep = array_filter(
            $selectedSlugsByStep,
            fn (array $slugs, int $step): bool => $slugs !== [] && LivingEditStep::tryFrom($step) !== null,
            ARRAY_FILTER_USE_BOTH,
        );

        if ($selectedSlugsByStep === []) {
            return [];
        }

        return array_values(LivingEditOption::query()
            ->where('is_active', true)
            ->where(function (Builder $query) use ($selectedSlugsByStep): void {
                foreach ($selectedSlugsByStep as $step => $slugs) {
                    $query->orWhere(fn (Builder $query): Builder => $query->where('step', $step)->whereIn('slug', $slugs));
                }
            })
            ->pluck('id')
            ->map(fn (mixed $id): int => (int) $id)
            ->all());
    }

    /**
     * Every active image with a file for the given slots, with its match counts, in one query.
     *
     * @param  list<int>  $selectedOptionIds
     * @param  list<MoodBoardImageSlot>  $slots
     * @return Collection<int, MoodBoardCandidate>
     */
    private function rankedCandidates(array $selectedOptionIds, array $slots, ?LivingSpace $space = null): Collection
    {
        $morphClass = (new GalleryImage)->getMorphClass();

        return GalleryImage::query()
            ->toBase()
            ->select(['gallery_images.id', 'gallery_images.slot'])
            ->selectRaw('count(distinct matched_options.step) as matched_steps')
            ->selectRaw('count(matched_options.id) as matched_options')
            ->leftJoin('gallery_image_living_edit_option as image_options', 'image_options.gallery_image_id', '=', 'gallery_images.id')
            ->leftJoin('living_edit_options as matched_options', function (JoinClause $join) use ($selectedOptionIds): void {
                $join->on('matched_options.id', '=', 'image_options.living_edit_option_id')
                    ->whereIn('matched_options.id', $selectedOptionIds);
            })
            ->where('gallery_images.is_active', true)
            ->whereIn('gallery_images.slot', array_map(fn (MoodBoardImageSlot $slot): int => $slot->value, $slots))
            ->when($space, fn (QueryBuilder $query, LivingSpace $space): QueryBuilder => $query->whereExists(
                fn (QueryBuilder $exists): QueryBuilder => $exists->selectRaw('1')
                    ->from('gallery_image_living_space')
                    ->whereColumn('gallery_image_living_space.gallery_image_id', 'gallery_images.id')
                    ->where('gallery_image_living_space.living_space_id', $space->getKey()),
            ))
            ->whereExists(fn (QueryBuilder $exists): QueryBuilder => $exists->selectRaw('1')
                ->from('media')
                ->whereColumn('media.model_id', 'gallery_images.id')
                ->where('media.model_type', $morphClass)
                ->where('media.collection_name', 'image'))
            ->groupBy(['gallery_images.id', 'gallery_images.slot'])
            ->get()
            ->map(fn (object $row): MoodBoardCandidate => new MoodBoardCandidate(
                imageId: (int) $row->id,
                slot: (int) $row->slot,
                matchedSteps: (int) $row->matched_steps,
                matchedOptions: (int) $row->matched_options,
            ));
    }

    /**
     * The best candidate of each slot. Among equally good candidates a kept image wins, otherwise
     * the seed decides, so the same choices and seed always give the same board.
     *
     * @param  Collection<int, MoodBoardCandidate>  $candidates
     * @param  list<int>  $keptImageIds
     * @return array<int, int> image id keyed by slot value
     */
    private function pickPerSlot(Collection $candidates, int $seed, array $keptImageIds): array
    {
        return $candidates
            ->groupBy(fn (MoodBoardCandidate $candidate): int => $candidate->slot)
            ->map(function (Collection $slotCandidates) use ($seed, $keptImageIds): int {
                $bestScore = $slotCandidates->max(fn (MoodBoardCandidate $candidate): int => $candidate->score());
                $best = $slotCandidates->filter(fn (MoodBoardCandidate $candidate): bool => $candidate->score() === $bestScore);

                foreach ($best as $candidate) {
                    if (in_array($candidate->imageId, $keptImageIds, true)) {
                        return $candidate->imageId;
                    }
                }

                return $best->sortBy(fn (MoodBoardCandidate $candidate): int => crc32("{$seed}:{$candidate->imageId}"))->first()->imageId;
            })
            ->all();
    }
}
