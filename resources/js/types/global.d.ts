import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            contact: {
                phoneNumber: string | null;
                email: string | null;
            };
            socials: {
                label: string;
                url: string;
            }[];
            /** The page's head tags, written on the server (see `serverHead`). */
            head: string[];
            [key: string]: unknown;
        };
    }
}
