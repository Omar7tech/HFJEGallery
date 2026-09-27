/** A kind of work, shown as an image card on the Work page. */
export interface WorkCategory {
    slug: string;
    name: string;
    description: string | null;
    /** Full-size WebP (the cards are wide), or the placeholder. */
    image: string;
}

/** A category as linked from its own page and from a project. */
export interface WorkCategoryLink {
    slug: string;
    name: string;
}

/** A sub-category a category's projects can be filtered by. */
export interface WorkTagLink {
    slug: string;
    name: string;
}

/** A category in the switcher of a category page, with its tags. */
export interface WorkCategoryNavItem extends WorkCategoryLink {
    tags: WorkTagLink[];
}

/** A project as shown on a category's grid. */
export interface ProjectCard {
    slug: string;
    name: string;
    location: string | null;
    year: number | null;
    /** WebP thumbnail of the cover, or the placeholder. */
    image: string;
    /** Names of the tags the project carries, in dashboard order. */
    tags: string[];
}

/** One gallery photo: the full WebP and a grid thumbnail. */
export interface ProjectImage {
    src: string;
    thumb: string;
}

/** A project with everything its own page shows. */
export interface ProjectDetail {
    slug: string;
    name: string;
    location: string | null;
    year: number | null;
    summary: string | null;
    /** The story as HTML from the rich editor, sanitized on the server. */
    description: string | null;
    /** Full-size WebP cover, or the placeholder. */
    cover: string;
    gallery: ProjectImage[];
}
