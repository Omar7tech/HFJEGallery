import { dominantColor } from '@/lib/dominant-color';
import type { MoodBoardSlot } from '@/types';

/** 4:5 portrait at twice the usual 1080px social size, sharp on any screen or print. */
const WIDTH = 2160;
const HEIGHT = 2700;
const MARGIN = 230;

const COLORS = {
    paper: '#f5f1ea',
    ink: '#191b17',
    muted: '#8a8580',
    brand: '#a65e3c',
    frame: '#e3d6c9',
    placeholder: '#dedede',
    defaultDark: '#6c4936',
    defaultLight: '#d6c2a6',
};

const DISPLAY_FONT = 'Michroma';
const TEXT_FONT = 'Instrument Sans';
const LOGO_URL = '/logos/mainlogo-dark.svg';

export type MoodBoardExport = {
    /** e.g. "Warm & Calm Kitchen" */
    title: string;
    spaceName: string;
    /** The visitor's choices, one group per step. */
    choices: { label: string; values: string[] }[];
    slots: MoodBoardSlot[];
};

type Rect = { x: number; y: number; width: number; height: number };

function loadImage(src: string): Promise<HTMLImageElement | null> {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;

    return image
        .decode()
        .then(() => image)
        .catch(() => null);
}

async function loadFonts(): Promise<void> {
    await Promise.allSettled([
        document.fonts.load(`76px "${DISPLAY_FONT}"`),
        document.fonts.load(`34px "${TEXT_FONT}"`),
        document.fonts.load(`600 34px "${TEXT_FONT}"`),
    ]);
}

/** Draws an image cropped to fill a rounded rectangle, like CSS object-fit: cover. */
function drawCover(
    context: CanvasRenderingContext2D,
    image: HTMLImageElement | null,
    rect: Rect,
    radius: number,
): void {
    context.save();
    context.beginPath();
    context.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
    context.clip();

    if (image) {
        const scale = Math.max(
            rect.width / image.naturalWidth,
            rect.height / image.naturalHeight,
        );
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;

        context.drawImage(
            image,
            rect.x + (rect.width - width) / 2,
            rect.y + (rect.height - height) / 2,
            width,
            height,
        );
    } else {
        context.fillStyle = COLORS.placeholder;
        context.fillRect(rect.x, rect.y, rect.width, rect.height);
    }

    context.restore();
}

function isLight(hex: string): boolean {
    const [red, green, blue] = [1, 3, 5].map((start) =>
        parseInt(hex.slice(start, start + 2), 16),
    );

    return 0.299 * red + 0.587 * green + 0.114 * blue > 150;
}

function drawSwatch(
    context: CanvasRenderingContext2D,
    rect: Rect,
    color: string,
): void {
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(rect.x, rect.y, rect.width, rect.height, 28);
    context.fill();

    context.fillStyle = isLight(color) ? COLORS.ink : '#ffffff';
    context.font = `600 34px "${TEXT_FONT}"`;
    context.textBaseline = 'bottom';
    context.fillText(
        color.toUpperCase(),
        rect.x + 32,
        rect.y + rect.height - 28,
    );
}

/** Shortens text with an ellipsis so it fits the given width. */
function fitText(
    context: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
): string {
    if (context.measureText(text).width <= maxWidth) {
        return text;
    }

    let shortened = text;

    while (
        shortened.length > 1 &&
        context.measureText(`${shortened}…`).width > maxWidth
    ) {
        shortened = shortened.slice(0, -1);
    }

    return `${shortened.trimEnd()}…`;
}

/** Splits a title over at most two lines. */
function wrapTitle(
    context: CanvasRenderingContext2D,
    title: string,
    maxWidth: number,
): string[] {
    const words = title.split(' ');
    const lines: string[] = [];
    let line = '';

    for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;

        if (context.measureText(candidate).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = candidate;
        }
    }

    lines.push(line);

    return lines.length > 2
        ? [lines[0], fitText(context, lines.slice(1).join(' '), maxWidth)]
        : lines;
}

/**
 * Renders the branded mood board image: header, title, the board with its colour swatches,
 * the visitor's choices and a footer.
 */
export async function renderMoodBoardImage(
    board: MoodBoardExport,
): Promise<Blob> {
    const imageAt = (slot: number) =>
        board.slots.find((entry) => entry.slot === slot)?.image ?? null;

    const [[large, topRight, smallLeft, smallMiddle, smallRight, logo]] =
        await Promise.all([
            Promise.all([
                ...[1, 2, 3, 4, 5].map((slot) => {
                    const image = imageAt(slot);

                    return image ? loadImage(image.url) : Promise.resolve(null);
                }),
                loadImage(LOGO_URL),
            ]),
            loadFonts(),
        ]);

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Canvas is not supported.');
    }

    context.imageSmoothingQuality = 'high';

    // Paper and a fine frame.
    context.fillStyle = COLORS.paper;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.strokeStyle = COLORS.frame;
    context.lineWidth = 3;
    context.strokeRect(60, 60, WIDTH - 120, HEIGHT - 120);

    // Header: logo on the left, edition and date on the right.
    const logoHeight = 92;

    if (logo) {
        const logoWidth = (logo.naturalWidth / logo.naturalHeight) * logoHeight;
        context.drawImage(logo, MARGIN, MARGIN, logoWidth, logoHeight);
    } else {
        context.fillStyle = COLORS.brand;
        context.font = `64px "${DISPLAY_FONT}"`;
        context.textBaseline = 'top';
        context.fillText('HFJE', MARGIN, MARGIN);
    }

    context.textAlign = 'right';
    context.textBaseline = 'top';
    context.fillStyle = COLORS.brand;
    context.font = `30px "${DISPLAY_FONT}"`;
    context.fillText('THE LIVING EDIT', WIDTH - MARGIN, MARGIN + 6);
    context.fillStyle = COLORS.muted;
    context.font = `30px "${TEXT_FONT}"`;
    context.fillText(
        new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }),
        WIDTH - MARGIN,
        MARGIN + 56,
    );
    context.textAlign = 'left';

    // Title.
    context.fillStyle = COLORS.muted;
    context.font = `32px "${TEXT_FONT}"`;
    context.fillText('HFJE LIVING COLLECTIONS  ·  MOOD BOARD', MARGIN, 322);

    context.fillStyle = COLORS.ink;
    context.font = `72px "${DISPLAY_FONT}"`;
    const titleLines = wrapTitle(context, board.title, WIDTH - MARGIN * 2);
    titleLines.forEach((line, index) =>
        context.fillText(line, MARGIN, 380 + index * 96),
    );

    // The board, with the same proportions as on the website.
    const boardTop = 380 + titleLines.length * 96 + 44;
    const boardSize = Math.min(WIDTH - MARGIN * 2, HEIGHT - 480 - boardTop);
    const boardLeft = (WIDTH - boardSize) / 2;
    const gap = 24;
    const smallGap = 16;

    const leftWidth = ((boardSize - gap) * 1.1) / 2.1;
    const rightWidth = boardSize - gap - leftWidth;
    const rightLeft = boardLeft + leftWidth + gap;
    const rowsHeight = boardSize - gap * 2;
    const topHeight = (rowsHeight * 1.65) / 3.35;
    const swatchHeight = rowsHeight / 3.35;
    const smallHeight = (rowsHeight * 0.7) / 3.35;

    drawCover(
        context,
        large,
        { x: boardLeft, y: boardTop, width: leftWidth, height: boardSize },
        36,
    );
    drawCover(
        context,
        topRight,
        { x: rightLeft, y: boardTop, width: rightWidth, height: topHeight },
        36,
    );

    const swatchTop = boardTop + topHeight + gap;
    const darkWidth = ((rightWidth - smallGap) * 2) / 3;

    drawSwatch(
        context,
        { x: rightLeft, y: swatchTop, width: darkWidth, height: swatchHeight },
        (large && dominantColor(large)) || COLORS.defaultDark,
    );
    drawSwatch(
        context,
        {
            x: rightLeft + darkWidth + smallGap,
            y: swatchTop,
            width: rightWidth - darkWidth - smallGap,
            height: swatchHeight,
        },
        (topRight && dominantColor(topRight)) || COLORS.defaultLight,
    );

    const smallTop = swatchTop + swatchHeight + gap;
    const smallWidth = (rightWidth - smallGap * 2) / 3;

    [smallLeft, smallMiddle, smallRight].forEach((image, index) =>
        drawCover(
            context,
            image,
            {
                x: rightLeft + index * (smallWidth + smallGap),
                y: smallTop,
                width: smallWidth,
                height: smallHeight,
            },
            24,
        ),
    );

    // The visitor's choices, two columns of two rows.
    context.textBaseline = 'top';
    const choicesTop = boardTop + boardSize + 60;
    const columnWidth = (WIDTH - MARGIN * 2) / 2;

    board.choices.slice(0, 4).forEach((choice, index) => {
        const x = MARGIN + (index % 2) * columnWidth;
        const y = choicesTop + Math.floor(index / 2) * 92;

        context.fillStyle = COLORS.brand;
        context.font = `24px "${DISPLAY_FONT}"`;
        context.fillText(choice.label.toUpperCase(), x, y);

        context.fillStyle = COLORS.ink;
        context.font = `36px "${TEXT_FONT}"`;
        context.fillText(
            fitText(
                context,
                choice.values.length > 0 ? choice.values.join(', ') : '—',
                columnWidth - 40,
            ),
            x,
            y + 38,
        );
    });

    // Footer.
    context.strokeStyle = COLORS.frame;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(MARGIN, HEIGHT - 190);
    context.lineTo(WIDTH - MARGIN, HEIGHT - 190);
    context.stroke();

    context.textBaseline = 'middle';
    context.fillStyle = COLORS.muted;
    context.font = `30px "${TEXT_FONT}"`;
    context.fillText(
        `Curated by HFJE for your ${board.spaceName.toLowerCase()}`,
        MARGIN,
        HEIGHT - 130,
    );
    context.textAlign = 'right';
    context.fillStyle = COLORS.brand;
    context.fillText(window.location.host, WIDTH - MARGIN, HEIGHT - 130);

    return new Promise((resolve, reject) =>
        canvas.toBlob(
            (blob) =>
                blob ? resolve(blob) : reject(new Error('Export failed.')),
            'image/jpeg',
            0.95,
        ),
    );
}

/**
 * Saves the branded image: the share sheet on phones (save to photos, send to a friend),
 * a download everywhere else.
 */
export async function saveMoodBoardImage(
    board: MoodBoardExport,
): Promise<void> {
    const blob = await renderMoodBoardImage(board);
    const slug = board.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const fileName = `hfje-living-edit-${slug || 'mood-board'}.jpg`;
    const file = new File([blob], fileName, { type: blob.type });

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    if (isTouchDevice && navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: board.title });

            return;
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }
        }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
