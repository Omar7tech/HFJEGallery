/** A curtain style from the dashboard, with its photo. */
export interface CurtainStyle {
    slug: string;
    name: string;
    description: string;
    /** Full-size WebP of the style photo. */
    image: string;
}
