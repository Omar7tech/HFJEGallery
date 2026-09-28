import PageHeader from '@/components/page-header';
import ProjectGrid from '@/components/project-grid';
import type { ProjectCard } from '@/types';

/** The curtain work portfolio: every project as a card, nine at a time. */
export default function CurtainWorks({
    works,
}: {
    works: { data: ProjectCard[] };
}) {
    return (
        <>
            <div className="@container px-5 pt-6 pb-20 max-md:pt-4 max-md:pb-12 md:px-8 md:pb-24 lg:pt-10 lg:pr-7 lg:pl-0">
                <PageHeader
                    back={{ label: 'Curtains', href: '/curtains' }}
                    title="Our Curtains Work"
                    lead="Curtains cut, tailored and fitted for the rooms they belong to."
                />

                <h2 className="sr-only">Projects</h2>

                <ProjectGrid
                    data="works"
                    projects={works.data}
                    hrefFor={(work) => `/curtains/work/${work.slug}`}
                    emptyMessage="Projects are being photographed. Check back soon."
                />
            </div>
        </>
    );
}
