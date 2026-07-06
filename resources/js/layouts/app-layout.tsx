import type { ReactNode } from 'react';
import SiteFooter from '@/components/site-footer';
import { NavBar, NavSidebar } from '@/components/site-nav';

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-dvh flex-col bg-white text-ink max-w-[1600px] mx-auto">
            {/* Mobile / tablet fixed brand bar — above the menu panel (z-60) */}
            <NavBar className="sticky top-0 z-[70] lg:hidden" />

            {/* Sidebar + content row */}
            <div className="flex flex-1">
                {/* Sticky sidebar — pinned while scrolling, part of the flow */}
                <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 lg:block">
                    <NavSidebar className="h-full" />
                </aside>

                {/* Page content */}
                <main className="min-w-0 flex-1 mb-8">{children}</main>
            </div>

            {/* Normal footer — full width, reached at the end of the scroll */}
            <SiteFooter />
        </div>
    );
}
