<?php

namespace App\Providers\Filament;

use App\Enums\LivingEditStep;
use App\Filament\LivingEdit\Resources\LivingEditOptions\LivingEditOptionResource;
use App\Filament\LivingEdit\Resources\LivingEditOptions\LivingEditOptionResourceConfiguration;
use Caresome\FilamentAuthDesigner\AuthDesignerPlugin;
use Caresome\FilamentAuthDesigner\Data\AuthPageConfig;
use Caresome\FilamentAuthDesigner\Enums\MediaPosition;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets\AccountWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->spa()
            ->sidebarWidth('14rem')
            ->profile()
            ->brandLogo(asset('logos/mainlogo-dark.svg'))
            ->brandLogoHeight('2rem')
            ->colors([
                'primary' => Color::hex('#a65e3c'),
                'gray' => Color::Stone,
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->resources(array_map(
                fn (LivingEditStep $step): LivingEditOptionResourceConfiguration => LivingEditOptionResource::make($step->key())->step($step),
                LivingEditStep::cases(),
            ))
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->widgets([
                AccountWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->plugin(
                AuthDesignerPlugin::make()
                    ->login(
                        fn (AuthPageConfig $config) => $config
                            ->media(asset('covers/cover.webp'))
                            ->mediaPosition(MediaPosition::Cover)
                            ->mediaSize('65%')
                    )
            )

            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
