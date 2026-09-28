<?php

namespace App\Filament\Support;

use App\Filament\Resources\BayteProducts\BayteProductResource;
use App\Filament\Resources\CurtainWorks\CurtainWorkResource;
use App\Filament\Resources\Projects\ProjectResource;
use App\Models\BayteProduct;
use App\Models\CurtainWork;
use App\Models\Project;
use BackedEnum;
use Filament\Navigation\NavigationItem;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\Support\Htmlable;

use function Filament\Support\generate_icon_html;

/**
 * Everything the ⌘K palette can do, built once per page and filtered in the
 * browser: every page in the navigation, every "new" form, the records people
 * look for by name, the live site, and the light or dark theme.
 */
class CommandPalette
{
    /** Records per kind sent to the page; the studio's catalogue fits well inside. */
    public const int RECORD_LIMIT = 300;

    /**
     * @return array{commands: list<array<string, mixed>>, icons: array<string, string>}
     */
    public static function build(): array
    {
        $icons = [];
        $commands = [];

        $icon = function (string|BackedEnum|Htmlable|null $icon) use (&$icons): ?string {
            if ($icon === null) {
                return null;
            }

            $key = $icon instanceof BackedEnum ? (string) $icon->value : md5((string) ($icon instanceof Htmlable ? $icon->toHtml() : $icon));
            $icons[$key] ??= generate_icon_html($icon)?->toHtml() ?? '';

            return $key;
        };

        foreach (filament()->getNavigation() as $group) {
            foreach (collect($group->getItems()) as $item) {
                if (! $item instanceof NavigationItem || blank($item->getUrl())) {
                    continue;
                }

                $commands[] = [
                    'group' => 'Go to',
                    'label' => $item->getLabel(),
                    'hint' => $group->getLabel(),
                    'url' => $item->getUrl(),
                    'icon' => $icon($item->getIcon()),
                ];
            }
        }

        foreach (filament()->getResources() as $resource) {
            /** @var class-string<resource> $resource */
            if (! $resource::hasPage('create') || ! $resource::canCreate()) {
                continue;
            }

            $commands[] = [
                'group' => 'Create',
                'label' => 'New '.$resource::getModelLabel(),
                'hint' => $resource::getNavigationGroup() instanceof BackedEnum ? null : $resource::getNavigationGroup(),
                'url' => $resource::getUrl('create'),
                'icon' => $icon(Heroicon::OutlinedPlus),
            ];
        }

        $records = [
            'Projects' => [ProjectResource::class, Project::query()->with('category:id,name'), fn (Project $project): ?string => $project->category?->name],
            'BAYTÉ pieces' => [BayteProductResource::class, BayteProduct::query()->with('category:id,name'), fn (BayteProduct $piece): ?string => $piece->category?->name],
            'Curtain projects' => [CurtainWorkResource::class, CurtainWork::query(), fn (CurtainWork $work): ?string => $work->location],
        ];

        foreach ($records as $group => [$resource, $query, $hint]) {
            $recordIcon = $icon($resource::getNavigationIcon());

            foreach ($query->latest()->limit(self::RECORD_LIMIT)->get() as $record) {
                $commands[] = [
                    'group' => $group,
                    'label' => (string) $record->getAttribute('name'),
                    'hint' => $hint($record),
                    'url' => $resource::getUrl('edit', ['record' => $record]),
                    'icon' => $recordIcon,
                    // Records only appear once something is typed.
                    'searchOnly' => true,
                ];
            }
        }

        $site = [
            'Home page' => '/',
            'Work' => '/work',
            'Curtains' => '/curtains',
            'BAYTÉ' => '/bayte',
            'The Living Edit' => '/living-edit',
            'About' => '/about',
            'Contact page' => '/contact',
        ];

        foreach ($site as $label => $path) {
            $commands[] = [
                'group' => 'The site',
                'label' => $label,
                'hint' => $path,
                'url' => url($path),
                'icon' => $icon(Heroicon::OutlinedArrowUpRight),
                'newTab' => true,
            ];
        }

        foreach (['light' => [Heroicon::OutlinedSun, 'Light'], 'dark' => [Heroicon::OutlinedMoon, 'Dark'], 'system' => [Heroicon::OutlinedComputerDesktop, 'Match the system']] as $theme => [$themeIcon, $label]) {
            $commands[] = [
                'group' => 'Appearance',
                'label' => "Theme: {$label}",
                'hint' => null,
                'theme' => $theme,
                'icon' => $icon($themeIcon),
            ];
        }

        return ['commands' => $commands, 'icons' => $icons];
    }
}
