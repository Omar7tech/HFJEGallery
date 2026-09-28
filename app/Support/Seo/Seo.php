<?php

namespace App\Support\Seo;

use Illuminate\Http\Request;

/**
 * The SEO of the request being answered, resolved once and shared by everything
 * that prints it.
 *
 * The site is an Inertia app with no SSR (and no Node on the server), so the
 * head a crawler reads has to be written here. These tags go out twice from
 * the same list: printed straight into the first HTML response by the root
 * template, and shared with the app as the `head` prop, which Inertia's
 * `serverHead` keeps in the document on every client-side visit. The two can't
 * drift apart, and no page component has to repeat a title or a description.
 *
 * Bound as scoped, so one request resolves its page once however many times
 * it is asked.
 */
final class Seo
{
    private ?SeoPage $page = null;

    public function __construct(
        private readonly Request $request,
        private readonly PageResolver $resolver,
        private readonly StructuredData $structuredData,
    ) {}

    public function page(): SeoPage
    {
        return $this->page ??= $this->resolver->resolve($this->request);
    }

    /**
     * The head as HTML tags, each keyed with `data-inertia` so the client
     * swaps it for its counterpart on the next page instead of stacking a
     * second one beside it.
     *
     * @return list<string>
     */
    public function headTags(): array
    {
        $page = $this->page();
        $image = asset(Studio::IMAGE);
        $name = Studio::NAME;

        return [
            $this->element('title', 'title', [], $page->title),
            $this->meta('description', ['name' => 'description', 'content' => $page->description]),
            $this->meta('keywords', ['name' => 'keywords', 'content' => $page->keywords !== '' ? $page->keywords : Studio::KEYWORDS]),
            $this->meta('robots', ['name' => 'robots', 'content' => $page->robots()]),
            $this->meta('googlebot', ['name' => 'googlebot', 'content' => $page->robots()]),
            $this->meta('author', ['name' => 'author', 'content' => Studio::LEGAL_NAME]),
            $this->element('link', 'canonical', ['rel' => 'canonical', 'href' => $page->canonical]),

            // Open Graph: what WhatsApp, Instagram and Facebook show when a link
            // is shared. The image is declared with its size, so the card is
            // laid out before the picture has finished downloading.
            $this->meta('og:type', ['property' => 'og:type', 'content' => $page->openGraphType]),
            $this->meta('og:site_name', ['property' => 'og:site_name', 'content' => $name]),
            $this->meta('og:title', ['property' => 'og:title', 'content' => $page->title]),
            $this->meta('og:description', ['property' => 'og:description', 'content' => $page->description]),
            $this->meta('og:url', ['property' => 'og:url', 'content' => $page->canonical]),
            $this->meta('og:image', ['property' => 'og:image', 'content' => $image]),
            $this->meta('og:image:secure_url', ['property' => 'og:image:secure_url', 'content' => $image]),
            $this->meta('og:image:type', ['property' => 'og:image:type', 'content' => 'image/jpeg']),
            $this->meta('og:image:width', ['property' => 'og:image:width', 'content' => (string) Studio::IMAGE_WIDTH]),
            $this->meta('og:image:height', ['property' => 'og:image:height', 'content' => (string) Studio::IMAGE_HEIGHT]),
            $this->meta('og:image:alt', ['property' => 'og:image:alt', 'content' => Studio::IMAGE_ALT]),
            $this->meta('og:locale', ['property' => 'og:locale', 'content' => 'en_US']),

            // X / Twitter
            $this->meta('twitter:card', ['name' => 'twitter:card', 'content' => 'summary_large_image']),
            $this->meta('twitter:title', ['name' => 'twitter:title', 'content' => $page->title]),
            $this->meta('twitter:description', ['name' => 'twitter:description', 'content' => $page->description]),
            $this->meta('twitter:image', ['name' => 'twitter:image', 'content' => $image]),
            $this->meta('twitter:image:alt', ['name' => 'twitter:image:alt', 'content' => Studio::IMAGE_ALT]),

            $this->element('script', 'schema', ['type' => 'application/ld+json'], $this->json($this->structuredData->graph($page)), escape: false),
        ];
    }

    /** @param array<string, string> $attributes */
    private function meta(string $key, array $attributes): string
    {
        return $this->element('meta', $key, $attributes);
    }

    /**
     * One head element. Void elements close themselves; the rest wrap their
     * content, escaped unless it is already safe (the JSON-LD below).
     *
     * @param  array<string, string>  $attributes
     */
    private function element(string $tag, string $key, array $attributes, ?string $content = null, bool $escape = true): string
    {
        $html = '<'.$tag.' data-inertia="'.e($key).'"';

        foreach ($attributes as $attribute => $value) {
            $html .= ' '.$attribute.'="'.e($value).'"';
        }

        if (in_array($tag, ['meta', 'link'], true)) {
            return $html.'>';
        }

        return $html.'>'.($escape ? e((string) $content) : (string) $content).'</'.$tag.'>';
    }

    /**
     * The graph as JSON that is safe inside a `<script>`: `<` and `>` are
     * escaped, so no text a visitor or an editor wrote can close the tag.
     *
     * @param  array<string, mixed>  $data
     */
    private function json(array $data): string
    {
        return (string) json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP);
    }
}
