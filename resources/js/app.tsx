import { createInertiaApp } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    // Applied to every page automatically; a page may override via `Page.layout`.
    layout: () => AppLayout,
    progress: {
        color: '#4B5563',
    },
});
