<?php

namespace App\Filament\Pages;

use Filament\Pages\Dashboard as BaseDashboard;

/**
 * The dashboard: what is on the site, how it has grown and how complete it
 * is, then anything that needs fixing. Messages live in their own inbox.
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
