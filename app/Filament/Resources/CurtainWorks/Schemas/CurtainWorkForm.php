<?php

namespace App\Filament\Resources\CurtainWorks\Schemas;

use App\Filament\Forms\PortfolioForm;
use Filament\Schemas\Schema;

class CurtainWorkForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components(PortfolioForm::sections());
    }
}
