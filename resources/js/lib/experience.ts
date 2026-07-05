/** Year the studio was founded — 27 years of craftsmanship as of 2026. */
export const FOUNDING_YEAR = 1999;

/**
 * Full years of craftsmanship, counted from {@link FOUNDING_YEAR}.
 * Increments automatically each new calendar year.
 */
export function yearsOfExperience(now: Date = new Date()): number {
    return now.getFullYear() - FOUNDING_YEAR;
}
