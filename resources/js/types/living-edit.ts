export type LivingSpace = {
    id: string;
    name: string;
    icon: string | null;
};

/** A selectable option of a Living Edit step. */
export type LivingEditOption = {
    id: string;
    name: string;
    icon: string | null;
};

export type MoodBoardImage = {
    id: number;
    /** WebP up to 1920px. */
    url: string;
    /** WebP up to 480px. */
    thumbUrl: string;
    alt: string;
};

/** A mood board position (1 Large, 2 Top right, 3-5 the small ones) and the image filling it. */
export type MoodBoardSlot = {
    slot: number;
    image: MoodBoardImage | null;
};
