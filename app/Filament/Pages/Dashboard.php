<?php

namespace App\Filament\Pages;

use Filament\Pages\Dashboard as BaseDashboard;

/**
 * The dashboard: a welcome, the inbox and how messages are trending, then
 * what is on the site, how it has grown and how complete it is, then
 * anything that needs fixing.
 */
class Dashboard extends BaseDashboard
{
    /**
     * No page title: the welcome card at the top greets instead.
     */
    public function getHeading(): string
    {
        return '';
    }

    /**
     * @return int|array<string, int>
     */
    public function getColumns(): int|array
    {
        return ['md' => 2, 'xl' => 3];
    }
}
