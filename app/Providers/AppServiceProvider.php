<?php

namespace App\Providers;

use App\Support\Seo\Seo;
use Carbon\CarbonImmutable;
use Filament\Support\Assets\Css;
use Filament\Support\Facades\FilamentAsset;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // One request resolves its page's SEO once, however many places print it.
        $this->app->scoped(Seo::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureCanonicalUrls();

        FilamentAsset::register([
            Css::make('mood-board-slot-picker', resource_path('css/filament/mood-board-slot-picker.css'))->loadedOnRequest(),
            Css::make('contact-messages', resource_path('css/filament/contact-messages.css')),
        ]);

        $this->configureRateLimiting();
    }

    /**
     * The mood board is rebuilt as visitors change their choices, so allow quick clicking
     * while stopping scripts from hammering the matching query.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('mood-board', fn (Request $request): Limit => Limit::perMinute(120)->by($request->ip()));

        // A person sends a message or two; anything faster is a script.
        RateLimiter::for('contact', fn (Request $request): array => [
            Limit::perMinute(3)->by('minute:'.$request->ip()),
            Limit::perHour(10)->by('hour:'.$request->ip()),
        ]);
    }

    /**
     * Build every URL on the configured domain, whatever host a request came in on.
     *
     * A visit through `www.`, plain `http://` or a preview hostname would
     * otherwise print that host in its canonical, its Open Graph URL and its
     * sitemap, and the same page would compete with itself in search.
     */
    protected function configureCanonicalUrls(): void
    {
        $url = (string) config('app.url');

        if (blank($url) || $this->app->runningInConsole()) {
            return;
        }

        URL::forceRootUrl($url);

        if (str_starts_with($url, 'https://')) {
            URL::forceScheme('https');
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
