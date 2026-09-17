/** Pixels are sampled from a tiny copy of the image, which is plenty to find its main colour. */
const SAMPLE_SIZE = 32;

/**
 * The most common colour of a loaded image, as a hex string.
 *
 * Similar colours are grouped (16 shades per channel) and the largest group is averaged, so
 * noise and gradients do not split the result. Returns null when the image cannot be read,
 * for example when it is served from another origin without CORS headers.
 */
export function dominantColor(image: HTMLImageElement): string | null {
    const canvas = document.createElement('canvas');
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;

    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) {
        return null;
    }

    let pixels: Uint8ClampedArray;

    try {
        context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        pixels = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;
    } catch {
        return null;
    }

    const groups = new Map<
        number,
        { count: number; red: number; green: number; blue: number }
    >();

    for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index + 3] < 128) {
            continue;
        }

        const [red, green, blue] = [
            pixels[index],
            pixels[index + 1],
            pixels[index + 2],
        ];
        const key = ((red >> 4) << 8) | ((green >> 4) << 4) | (blue >> 4);
        const group = groups.get(key) ?? {
            count: 0,
            red: 0,
            green: 0,
            blue: 0,
        };

        group.count++;
        group.red += red;
        group.green += green;
        group.blue += blue;
        groups.set(key, group);
    }

    let largest: {
        count: number;
        red: number;
        green: number;
        blue: number;
    } | null = null;

    for (const group of groups.values()) {
        if (!largest || group.count > largest.count) {
            largest = group;
        }
    }

    if (!largest) {
        return null;
    }

    const toHex = (total: number) =>
        Math.round(total / largest.count)
            .toString(16)
            .padStart(2, '0');

    return `#${toHex(largest.red)}${toHex(largest.green)}${toHex(largest.blue)}`;
}
