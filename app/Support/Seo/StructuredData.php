<?php

namespace App\Support\Seo;

use App\Settings\GeneralSettings;

/**
 * The schema.org graph for a page: the studio, the site, the page itself, its
 * breadcrumb trail, and whatever the page is about (a project, a curtain
 * service, a list of work).
 *
 * One `@graph` rather than loose scripts, so every node points at the others
 * by `@id` and Google reads them as one business with one website.
 */
final class StructuredData
{
    public function __construct(private readonly GeneralSettings $settings) {}

    /** @return array<string, mixed> */
    public function graph(SeoPage $page): array
    {
        return [
            '@context' => 'https://schema.org',
            '@graph' => [
                $this->organization(),
                $this->website(),
                $this->webPage($page),
                $this->breadcrumbs($page),
                ...$page->nodes,
            ],
        ];
    }

    /**
     * The studio: the node Google builds the knowledge panel from. Contact
     * details and profiles come from the dashboard settings, and anything left
     * unset is left out rather than published empty.
     *
     * @return array<string, mixed>
     */
    private function organization(): array
    {
        $home = route('home');
        $phone = $this->settings->usablePhoneNumber();
        $email = filled($this->settings->email) ? $this->settings->email : null;

        return array_filter([
            '@type' => 'HomeAndConstructionBusiness',
            '@id' => $home.'#organization',
            'name' => Studio::NAME,
            'legalName' => Studio::LEGAL_NAME,
            'alternateName' => [Studio::LEGAL_NAME, Studio::ARABIC_NAME, 'HFJE Gallery'],
            'slogan' => Studio::SLOGAN,
            'description' => Studio::DESCRIPTION,
            'url' => $home,
            'logo' => [
                '@type' => 'ImageObject',
                '@id' => $home.'#logo',
                'url' => asset(Studio::LOGO),
                'width' => 512,
                'height' => 512,
                'caption' => Studio::NAME,
            ],
            'image' => ['@id' => $home.'#logo'],
            'foundingDate' => (string) Studio::FOUNDED,
            'telephone' => $phone,
            'email' => $email,
            'areaServed' => ['@type' => 'Country', 'name' => Studio::COUNTRY_NAME],
            'address' => ['@type' => 'PostalAddress', 'addressCountry' => Studio::COUNTRY],
            'contactPoint' => $phone || $email ? [array_filter([
                '@type' => 'ContactPoint',
                'contactType' => 'customer service',
                'telephone' => $phone,
                'email' => $email,
                'areaServed' => Studio::COUNTRY,
                'availableLanguage' => ['English', 'Arabic', 'French'],
                'url' => route('contact'),
            ])] : null,
            'knowsAbout' => [
                'Interior design',
                'Home furnishing',
                'Custom curtains',
                'Upholstery',
                'Textiles',
                'Furniture',
            ],
            'brand' => ['@type' => 'Brand', 'name' => 'BAYTÉ', 'url' => route('bayte')],
            'hasOfferCatalog' => [
                '@type' => 'OfferCatalog',
                'name' => 'HFJE services',
                'itemListElement' => [
                    $this->offer('Interior design & furnishing', 'Homes, apartments, restaurants and commercial spaces, designed and furnished around the people who use them.', route('work.index')),
                    $this->offer('Custom curtains & textiles', 'Made-to-measure curtains: fabric selection, measurement, tailoring and installation.', route('curtains')),
                    $this->offer('BAYTÉ furniture', 'Ready-to-purchase furniture designed for modern Lebanese homes.', route('bayte')),
                ],
            ],
            'sameAs' => $this->sameAs(),
        ], fn (mixed $value): bool => $value !== null && $value !== []);
    }

    /** @return array<string, mixed> */
    private function website(): array
    {
        $home = route('home');

        return [
            '@type' => 'WebSite',
            '@id' => $home.'#website',
            'url' => $home,
            'name' => Studio::NAME,
            'alternateName' => Studio::LEGAL_NAME,
            'inLanguage' => 'en',
            'publisher' => ['@id' => $home.'#organization'],
        ];
    }

    /** @return array<string, mixed> */
    private function webPage(SeoPage $page): array
    {
        $home = route('home');
        $image = $page->images[0] ?? asset(Studio::IMAGE);

        return array_filter([
            '@type' => $page->schemaType,
            '@id' => $page->canonical.'#webpage',
            'url' => $page->canonical,
            'name' => $page->title,
            'description' => $page->description,
            'inLanguage' => 'en',
            'isPartOf' => ['@id' => $home.'#website'],
            'about' => ['@id' => $home.'#organization'],
            'mainEntity' => $page->mainEntityId ? ['@id' => $page->mainEntityId] : null,
            'primaryImageOfPage' => ['@type' => 'ImageObject', 'url' => $image],
            'breadcrumb' => ['@id' => $page->canonical.'#breadcrumb'],
        ]);
    }

    /** @return array<string, mixed> */
    private function breadcrumbs(SeoPage $page): array
    {
        return [
            '@type' => 'BreadcrumbList',
            '@id' => $page->canonical.'#breadcrumb',
            'itemListElement' => array_map(fn (array $crumb, int $index): array => [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $crumb['name'],
                'item' => $crumb['url'],
            ], $page->breadcrumbs, array_keys($page->breadcrumbs)),
        ];
    }

    /** @return array<string, mixed> */
    private function offer(string $name, string $description, string $url): array
    {
        return [
            '@type' => 'Offer',
            'itemOffered' => [
                '@type' => 'Service',
                'name' => $name,
                'description' => $description,
                'url' => $url,
                'provider' => ['@id' => route('home').'#organization'],
                'areaServed' => ['@type' => 'Country', 'name' => Studio::COUNTRY_NAME],
            ],
        ];
    }

    /**
     * The studio's profiles elsewhere, so Google can tie them to it. A link
     * that points back at this site is dropped: that is not a profile.
     *
     * @return list<string>
     */
    private function sameAs(): array
    {
        $host = parse_url(route('home'), PHP_URL_HOST);

        $urls = array_filter(
            array_column($this->settings->usableSocialLinks(), 'url'),
            fn (string $url): bool => filter_var($url, FILTER_VALIDATE_URL) !== false
                && parse_url($url, PHP_URL_HOST) !== $host,
        );

        return array_values(array_unique($urls));
    }
}
