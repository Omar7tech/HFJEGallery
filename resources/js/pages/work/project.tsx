import ProjectDetail from '@/components/project-detail';
import type {
    ProjectDetail as Project,
    ProjectLink,
    WorkCategoryLink,
} from '@/types';

interface WorkProjectProps {
    category: WorkCategoryLink;
    project: Project;
    nextProject: ProjectLink | null;
}

export default function WorkProject({
    category,
    project,
    nextProject,
}: WorkProjectProps) {
    return (
        <ProjectDetail
            project={project}
            parent={{ name: category.name, href: `/work/${category.slug}` }}
            next={
                nextProject && {
                    ...nextProject,
                    href: `/work/${category.slug}/${nextProject.slug}`,
                }
            }
        />
    );
}
