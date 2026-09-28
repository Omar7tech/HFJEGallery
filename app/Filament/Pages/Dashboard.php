<?php

namespace App\Filament\Pages;

use Filament\Pages\Dashboard as BaseDashboard;

/**
 * The dashboard: the inbox first, then how messages are trending, then the
 * state of the site's content and anything in it that needs fixing.
 */
class Dashboard extends BaseDashboard
{
    /**
     * @return int|array<string, int>
     */
    public function getColumns(): int|array
    {
        return ['md' => 2, 'xl' => 3];
    }
}
