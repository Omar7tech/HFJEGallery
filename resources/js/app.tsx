import { createInertiaApp } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

createInertiaApp({
    // The server writes each page's full title (and the rest of its head),
    // so it is used exactly as sent.
    title: (title) => title,
    // Keep the server's head (title, meta, Open Graph, canonical, schema.org)
    // in the document on every visit: it arrives as the `head` prop.
    // @see App\Support\Seo\Seo::headTags()
    serverHead: true,
    // Applied to every page automatically; a page may override via `Page.layout`.
    layout: () => AppLayout,
    progress: {
        color: '#4B5563',
    },
});
