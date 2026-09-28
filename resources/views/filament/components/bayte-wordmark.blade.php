@php
    /*
     * The BAYTÉ wordmark, inlined so its ink follows the text colour (dark on
     * paper, cream in dark mode) while the accent keeps its terracotta. Its
     * own <style> block is dropped: class names in inline SVG leak into the
     * whole page.
     */
    $svg = file_get_contents(public_path('logos/bayte.svg'));
    $svg = preg_replace(['/<\?xml.*?\?>/s', '/<!--.*?-->/s', '/<defs>.*?<\/defs>/s'], '', $svg);
    $svg = str_replace(
        ['class="st1"', 'class="st0"', '<svg '],
        ['fill="currentColor"', 'fill="#ab6744"', '<svg class="h-7 w-auto text-(--hf-text) md:h-8" aria-hidden="true" focusable="false" '],
        $svg,
    );
@endphp

<span class="inline-flex">
    <span class="sr-only">{{ $label ?? 'BAYTÉ' }}</span>
    {!! $svg !!}
</span>
