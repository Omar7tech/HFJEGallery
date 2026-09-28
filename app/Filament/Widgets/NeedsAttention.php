<?php

namespace App\Filament\Widgets;

use App\Filament\Pages\ManageBayte;
use App\Filament\Pages\ManageGeneral;
use App\Filament\Resources\BayteCategories\BayteCategoryResource;
use App\Filament\Resources\BayteProducts\BayteProductResource;
use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Filament\Resources\CurtainStyles\CurtainStyleResource;
use App\Filament\Resources\CurtainWorks\CurtainWorkResource;
use App\Filament\Resources\Projects\ProjectResource;
use App\Filament\Resources\WorkCategories\WorkCategoryResource;
use App\Models\BayteCategory;
use App\Models\BayteProduct;
use App\Models\ContactMessage;
use App\Models\CurtainStyle;
use App\Models\CurtainWork;
use App\Models\Project;
use App\Models\WorkCategory;
use App\Settings\BayteSettings;
use App\Settings\GeneralSettings;
use Filament\Actions\Action;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Database\Eloquent\Builder;

/**
 * A checklist of what is missing or off on the site: pieces without photos,
 * empty shelves, settings not filled in, messages left waiting. Each row
 * links to where it is fixed; a clean site shows an empty list.
 */
class NeedsAttention extends TableWidget
{
    protected static ?int $sort = 9;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Needs attention';

    public function table(Table $table): Table
    {
        return $table
            ->records(fn (): array => $this->issues())
            ->paginated(false)
            ->columns([
                TextColumn::make('issue')
                    ->label('What')
                    ->weight('medium')
                    ->description(fn (array $record): string => $record['why']),
                TextColumn::make('area')
                    ->badge()
                    ->color('gray'),
                TextColumn::make('severity')
                    ->label('')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => $state === 'danger' ? 'Fix soon' : 'Worth a look')
                    ->color(fn (string $state): string => $state),
            ])
            ->recordActions([
                Action::make('fix')
                    ->label('Fix')
                    ->icon(Heroicon::ArrowRight)
                    ->iconPosition('after')
                    ->url(fn (array $record): string => $record['url']),
            ])
            ->emptyStateIcon(Heroicon::OutlinedCheckBadge)
            ->emptyStateHeading('Everything looks good')
            ->emptyStateDescription('No missing photos, empty categories or waiting messages.');
    }

    /**
     * Every check that currently finds something, keyed by a stable id.
     *
     * @return array<string, array{issue: string, why: string, area: string, severity: string, url: string}>
     */
    private function issues(): array
    {
        $overdue = ContactMessage::query()
            ->whereNull('read_at')
            ->where('created_at', '<', now()->subDays(ContactMessage::OVERDUE_DAYS))
            ->count();
        $general = app(GeneralSettings::class);

        $checks = [
            'overdue-messages' => [
                $overdue,
                fn (int $count): string => $this->plural($count, 'message').' unread for over '.ContactMessage::OVERDUE_DAYS.' days',
                'People are waiting for a reply.',
                'Inbox',
                'danger',
                ContactMessageResource::getUrl('index', ['filters' => ['read_at' => ['value' => '0']]]),
            ],
            'bayte-whatsapp' => [
                (int) (app(BayteSettings::class)->whatsappDigits() === null),
                fn (): string => 'No WhatsApp number for BAYTÉ',
                'Visitors can build a selection but can’t send it.',
                'BAYTÉ',
                'danger',
                ManageBayte::getUrl(),
            ],
            'bayte-photos' => [
                $this->withoutMedia(BayteProduct::query(), 'image'),
                fn (int $count): string => $this->plural($count, 'BAYTÉ piece').' without a photo',
                'They show a placeholder in the catalogue.',
                'BAYTÉ',
                'danger',
                BayteProductResource::getUrl('index'),
            ],
            'bayte-empty-categories' => [
                BayteCategory::query()->doesntHave('products')->count(),
                fn (int $count): string => $this->plural($count, 'BAYTÉ category', 'BAYTÉ categories').' with no pieces',
                'Empty categories are hidden from the site.',
                'BAYTÉ',
                'warning',
                BayteCategoryResource::getUrl('index'),
            ],
            'project-covers' => [
                $this->withoutMedia(Project::query(), 'cover'),
                fn (int $count): string => $this->plural($count, 'project').' without a cover image',
                'The cover is what the project card shows.',
                'Work',
                'danger',
                ProjectResource::getUrl('index'),
            ],
            'work-empty-categories' => [
                WorkCategory::query()->doesntHave('projects')->count(),
                fn (int $count): string => $this->plural($count, 'work category', 'work categories').' with no projects',
                'Visitors who open them find nothing.',
                'Work',
                'warning',
                WorkCategoryResource::getUrl('index'),
            ],
            'curtain-covers' => [
                $this->withoutMedia(CurtainWork::query(), 'cover'),
                fn (int $count): string => $this->plural($count, 'curtain project').' without a cover image',
                'The cover is what the project card shows.',
                'Curtains',
                'danger',
                CurtainWorkResource::getUrl('index'),
            ],
            'curtain-style-images' => [
                $this->withoutMedia(CurtainStyle::query()->where('is_active', true), 'image'),
                fn (int $count): string => $this->plural($count, 'live curtain style').' without an image',
                'Styles are chosen by their picture.',
                'Curtains',
                'warning',
                CurtainStyleResource::getUrl('index'),
            ],
            'contact-details' => [
                (int) ($general->usablePhoneNumber() === null && blank($general->email)),
                fn (): string => 'No phone number or email on the site',
                'The contact page and footer have no direct line to the studio.',
                'Settings',
                'warning',
                ManageGeneral::getUrl(),
            ],
        ];

        $urgent = [];
        $later = [];

        foreach ($checks as $key => [$count, $describe, $why, $area, $severity, $url]) {
            if ($count === 0) {
                continue;
            }

            $issue = [
                'issue' => $describe($count),
                'why' => $why,
                'area' => $area,
                'severity' => $severity,
                'url' => $url,
            ];

            // The urgent ones first.
            if ($severity === 'danger') {
                $urgent[$key] = $issue;
            } else {
                $later[$key] = $issue;
            }
        }

        return [...$urgent, ...$later];
    }

    /**
     * @param  Builder<*>  $query
     */
    private function withoutMedia(Builder $query, string $collection): int
    {
        return $query->whereDoesntHave('media', fn (Builder $media) => $media->where('collection_name', $collection))->count();
    }

    private function plural(int $count, string $singular, ?string $plural = null): string
    {
        return $count.' '.($count === 1 ? $singular : ($plural ?? $singular.'s'));
    }
}
