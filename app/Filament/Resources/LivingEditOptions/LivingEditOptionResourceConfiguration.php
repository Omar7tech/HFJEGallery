<?php

namespace App\Filament\Resources\LivingEditOptions;

use App\Enums\LivingEditStep;
use Filament\Resources\ResourceConfiguration;

/**
 * Registers the options resource once per Living Edit step, each with its own sidebar item and URL.
 */
class LivingEditOptionResourceConfiguration extends ResourceConfiguration
{
    protected LivingEditStep $step;

    public function step(LivingEditStep $step): static
    {
        $this->step = $step;

        return $this->slug("{$step->key()}-options");
    }

    public function getStep(): LivingEditStep
    {
        return $this->step;
    }
}
