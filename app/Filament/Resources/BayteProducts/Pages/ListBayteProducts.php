<?php

namespace App\Filament\Resources\BayteProducts\Pages;

use App\Filament\Resources\BayteProducts\BayteProductResource;
use App\Models\BayteCategory;
use App\Models\BayteProduct;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Contracts\Support\Htmlable;

class ListBayteProducts extends ListRecords
{
    protected static string $resource = BayteProductResource::class;

    /**
     * The collection's own wordmark in place of a plain title.
     */
    public function getHeading(): Htmlable
    {
        return view('filament.components.bayte-wordmark', ['label' => 'BAYTÉ products']);
    }

    public function getSubheading(): string
    {
        $pieces = BayteProduct::count();
        $categories = BayteCategory::count();

        return ($pieces === 1 ? '1 piece' : "{$pieces} pieces")
            .' in '
            .($categories === 1 ? '1 category' : "{$categories} categories");
    }

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
