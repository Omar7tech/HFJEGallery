<?php

namespace App\Filament\Resources\GalleryImages;

use App\Filament\Resources\GalleryImages\Pages\CreateGalleryImage;
use App\Filament\Resources\GalleryImages\Pages\EditGalleryImage;
use App\Filament\Resources\GalleryImages\Pages\ListGalleryImages;
use App\Filament\Resources\GalleryImages\Schemas\GalleryImageForm;
use App\Filament\Resources\GalleryImages\Tables\GalleryImagesTable;
use App\Models\GalleryImage;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class GalleryImageResource extends Resource
{
    protected static ?string $model = GalleryImage::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPhoto;

    protected static string|UnitEnum|null $navigationGroup = 'Moodboard';

    protected static ?int $navigationSort = 10;

    protected static ?string $navigationLabel = 'Gallery';

    protected static ?string $modelLabel = 'Gallery Image';

    protected static ?string $pluralModelLabel = 'Gallery';

    protected static ?string $slug = 'gallery';

    public static function form(Schema $schema): Schema
    {
        return GalleryImageForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return GalleryImagesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListGalleryImages::route('/'),
            'create' => CreateGalleryImage::route('/create'),
            'edit' => EditGalleryImage::route('/{record}/edit'),
        ];
    }
}
