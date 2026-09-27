<?php

namespace App\Filament\Resources\CurtainWorks\Tables;

use App\Filament\Tables\PortfolioTable;
use Filament\Tables\Table;

class CurtainWorksTable
{
    public static function configure(Table $table): Table
    {
        return PortfolioTable::configure($table);
    }
}
