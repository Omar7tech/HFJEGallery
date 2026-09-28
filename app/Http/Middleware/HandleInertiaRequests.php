<?php

namespace App\Http\Middleware;

use App\Settings\GeneralSettings;
use App\Support\Seo\Seo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = app(GeneralSettings::class);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'contact' => [
                'phoneNumber' => $settings->usablePhoneNumber(),
                'email' => filled($settings->email) ? $settings->email : null,
            ],
            'socials' => $settings->usableSocialLinks(),
            // The page's whole head (title, meta, Open Graph, canonical and the
            // schema.org graph), kept in the document by Inertia's `serverHead`
            // on every visit. Always sent, so a partial reload (a search, a
            // filter) retitles the page too.
            'head' => Inertia::always(fn (): array => app(Seo::class)->headTags()),
        ];
    }
}
