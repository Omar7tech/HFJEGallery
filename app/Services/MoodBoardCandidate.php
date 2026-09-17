<?php

namespace App\Services;

/**
 * An image that could fill a mood board slot, with how well it matches the visitor's choices.
 */
final readonly class MoodBoardCandidate
{
    public function __construct(
        public int $imageId,
        public int $slot,
        public int $matchedSteps,
        public int $matchedOptions,
    ) {}

    /**
     * Matching one more step always outranks carrying more options within the same steps.
     */
    public function score(): int
    {
        return $this->matchedSteps * 1000 + $this->matchedOptions;
    }
}
