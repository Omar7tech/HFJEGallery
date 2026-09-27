import ProjectDetail from '@/components/project-detail';
import type { ProjectDetail as Project, ProjectLink } from '@/types';

interface CurtainWorkProps {
    work: Project;
    nextWork: ProjectLink | null;
}

export default function CurtainWork({ work, nextWork }: CurtainWorkProps) {
    return (
        <ProjectDetail
            project={work}
            parent={{ name: 'Curtain Projects', href: '/curtains/work' }}
            next={
                nextWork && {
                    ...nextWork,
                    href: `/curtains/work/${nextWork.slug}`,
                }
            }
        />
    );
}
