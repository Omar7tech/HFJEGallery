{{--
    The page in plain HTML, for whoever reads it before running its JavaScript.

    Everything a visitor sees is painted by React, so the raw document a
    crawler fetches is otherwise an empty div. This puts the page's heading,
    words and links into that document, inside `<noscript>` so it is never
    drawn over the real page, and gives the first indexing pass something to
    read and somewhere to go next.

    @see App\Support\Seo\PageResolver
--}}
@php
    $seoPage = app(\App\Support\Seo\Seo::class)->page();
    $studioSettings = app(\App\Settings\GeneralSettings::class);
@endphp

@if ($seoPage->indexable)
    <noscript>
        <header>
            <a href="{{ route('home') }}">{{ \App\Support\Seo\Studio::NAME }} · {{ \App\Support\Seo\Studio::LEGAL_NAME }}</a>
            <nav aria-label="Main navigation">
                <ul>
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><a href="{{ route('work.index') }}">Work</a></li>
                    <li><a href="{{ route('curtains') }}">Curtains &amp; Textiles</a></li>
                    <li><a href="{{ route('bayte') }}">BAYTÉ</a></li>
                    <li><a href="{{ route('living-edit') }}">The Living Edit</a></li>
                    <li><a href="{{ route('about') }}">About</a></li>
                    <li><a href="{{ route('contact') }}">Contact</a></li>
                </ul>
            </nav>
        </header>

        <main>
            @if (count($seoPage->breadcrumbs) > 1)
                <nav aria-label="Breadcrumb">
                    <ol>
                        @foreach ($seoPage->breadcrumbs as $crumb)
                            <li><a href="{{ $crumb['url'] }}">{{ $crumb['name'] }}</a></li>
                        @endforeach
                    </ol>
                </nav>
            @endif

            <h1>{{ $seoPage->title }}</h1>
            <p>{{ $seoPage->description }}</p>

            @foreach ($seoPage->outline as $section)
                @if ($section['items'] !== [])
                    <section>
                        <h2>{{ $section['heading'] }}</h2>
                        <ul>
                            @foreach ($section['items'] as $item)
                                <li>
                                    @if (filled($item['url'] ?? null))
                                        <a href="{{ $item['url'] }}">{{ $item['label'] }}</a>
                                    @else
                                        <strong>{{ $item['label'] }}</strong>
                                    @endif
                                    @if (filled($item['text'] ?? null))
                                        <p>{{ $item['text'] }}</p>
                                    @endif
                                </li>
                            @endforeach
                        </ul>
                    </section>
                @endif
            @endforeach

            @foreach (array_slice($seoPage->images, 0, 6) as $image)
                <img src="{{ $image }}" alt="{{ $seoPage->title }}" loading="lazy">
            @endforeach
        </main>

        <footer>
            <p>{{ \App\Support\Seo\Studio::LEGAL_NAME }}: {{ \App\Support\Seo\Studio::SLOGAN }}. Interiors, curtains and furniture across Lebanon since {{ \App\Support\Seo\Studio::FOUNDED }}.</p>
            @if ($phone = $studioSettings->usablePhoneNumber())
                <p>Call <a href="tel:{{ preg_replace('/[^\d+]/', '', $phone) }}">{{ $phone }}</a></p>
            @endif
            @if (filled($studioSettings->email))
                <p>Email <a href="mailto:{{ $studioSettings->email }}">{{ $studioSettings->email }}</a></p>
            @endif
            <ul>
                <li><a href="{{ route('privacy') }}">Privacy Policy</a></li>
                <li><a href="{{ route('terms') }}">Terms of Use</a></li>
            </ul>
        </footer>
    </noscript>
@endif
