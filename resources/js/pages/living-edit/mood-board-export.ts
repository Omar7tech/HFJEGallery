import { dominantColor } from '@/lib/dominant-color';
import type { MoodBoardSlot } from '@/types';

/** Twice the usual 1080px social width, sharp on any screen or print. */
const WIDTH = 2160;
const MARGIN = 100;
const CONTENT_WIDTH = WIDTH - MARGIN * 2;

const COLORS = {
    paper: '#f5f1ea',
    ink: '#191b17',
    muted: '#8a8580',
    brand: '#a65e3c',
    placeholder: '#dedede',
    defaultDark: '#6c4936',
    defaultLight: '#d6c2a6',
};

const DISPLAY_FONT = 'Michroma';
const TEXT_FONT = 'Instrument Sans';
const LOGO_URL = '/logos/mainlogo-dark.svg';

const SIZES = {
    logoHeight: 84,
    headerTitle: 34,
    headerDate: 26,
    headerDateOffset: 50,
    sectionGap: 48,
    boardGap: 20,
    boardSmallGap: 14,
    choiceColumnGap: 48,
    choiceLabel: 22,
    choiceLabelGap: 14,
    choiceValue: 30,
    choiceValueLineHeight: 40,
    choiceValueLines: 2,
    footer: 26,
};

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
        document.fonts.load(`${SIZES.choiceLabel}px "${DISPLAY_FONT}"`),
        document.fonts.load(`${SIZES.choiceValue}px "${TEXT_FONT}"`),
        document.fonts.load(`600 ${SIZES.headerTitle}px "${TEXT_FONT}"`),
    ]);
}

/** Letter spacing where the browser supports it on canvas; plain text elsewhere. */
function setLetterSpacing(
    context: CanvasRenderingContext2D,
    spacing: string,
): void {
    if ('letterSpacing' in context) {
        context.letterSpacing = spacing;
    }
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

/** Word-wraps text into at most `maxLines` lines, shortening the last line when needed. */
function wrapText(
    context: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxLines: number,
): string[] {
    const lines: string[] = [];
    let line = '';

    for (const word of text.split(/\s+/).filter(Boolean)) {
        const candidate = line ? `${line} ${word}` : word;

        if (context.measureText(candidate).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = candidate;
        }
    }

    lines.push(line);

    const visible = lines.slice(0, maxLines);

    if (lines.length > maxLines) {
        visible[maxLines - 1] = lines.slice(maxLines - 1).join(' ');
    }

    return visible.map((entry) => fitText(context, entry, maxWidth));
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

    if (image && image.naturalWidth > 0 && image.naturalHeight > 0) {
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

/** A colour swatch with its hex code, sized so the code always fits inside. */
function drawSwatch(
    context: CanvasRenderingContext2D,
    rect: Rect,
    color: string,
    radius: number,
): void {
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
    context.fill();

    const fontSize = Math.round(
        Math.min(34, Math.max(18, rect.width * 0.11, rect.height * 0.1)),
    );
    const padding = Math.round(fontSize * 0.9);

    if (rect.width < padding * 2 + fontSize * 2 || rect.height < fontSize * 2) {
        return;
    }

    context.save();
    context.fillStyle = isLight(color) ? COLORS.ink : '#ffffff';
    context.font = `600 ${fontSize}px "${TEXT_FONT}"`;
    context.textAlign = 'left';
    context.textBaseline = 'bottom';
    setLetterSpacing(context, '1px');
    context.fillText(
        fitText(context, color.toUpperCase(), rect.width - padding * 2),
        rect.x + padding,
        rect.y + rect.height - padding,
    );
    context.restore();
}

/** Draws the board with the same proportions as on the website. */
function drawBoard(
    context: CanvasRenderingContext2D,
    rect: Rect,
    images: (HTMLImageElement | null)[],
): void {
    const [large, topRight, smallLeft, smallMiddle, smallRight] = images;
    const { boardGap: gap, boardSmallGap: smallGap } = SIZES;
    const radius = Math.round(rect.width * 0.018);
    const smallRadius = Math.round(radius * 0.7);

    const leftWidth = ((rect.width - gap) * 1.1) / 2.1;
    const rightWidth = rect.width - gap - leftWidth;
    const rightLeft = rect.x + leftWidth + gap;
    const rowsHeight = rect.height - gap * 2;
    const topHeight = (rowsHeight * 1.65) / 3.35;
    const swatchHeight = rowsHeight / 3.35;
    const smallHeight = (rowsHeight * 0.7) / 3.35;

    drawCover(
        context,
        large,
        { x: rect.x, y: rect.y, width: leftWidth, height: rect.height },
        radius,
    );
    drawCover(
        context,
        topRight,
        { x: rightLeft, y: rect.y, width: rightWidth, height: topHeight },
        radius,
    );

    const swatchTop = rect.y + topHeight + gap;
    const darkWidth = ((rightWidth - smallGap) * 2) / 3;

    drawSwatch(
        context,
        { x: rightLeft, y: swatchTop, width: darkWidth, height: swatchHeight },
        (large && dominantColor(large)) || COLORS.defaultDark,
        radius,
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
        radius,
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
            smallRadius,
        ),
    );
}

/**
 * Renders the branded mood board image: a slim header, the board at full width, the visitor's
 * choices in one row and a small footer. The image is exactly as tall as its content, and all
 * text is measured and fitted to its column, so nothing overlaps or runs off the edges.
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
    canvas.height = 1;

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Canvas is not supported.');
    }

    // Measure the choices first, so the image can be exactly as tall as its content.
    const choices = board.choices.slice(0, 4);
    const columns = Math.max(choices.length, 1);
    const columnWidth =
        (CONTENT_WIDTH - (columns - 1) * SIZES.choiceColumnGap) / columns;

    context.font = `${SIZES.choiceValue}px "${TEXT_FONT}"`;
    const choiceLines = choices.map((choice) =>
        wrapText(
            context,
            choice.values.length > 0 ? choice.values.join(', ') : '—',
            columnWidth,
            SIZES.choiceValueLines,
        ),
    );
    const choicesHeight =
        choices.length > 0
            ? SIZES.choiceLabel +
              SIZES.choiceLabelGap +
              Math.max(...choiceLines.map((lines) => lines.length)) *
                  SIZES.choiceValueLineHeight
            : 0;

    const boardTop = MARGIN + SIZES.logoHeight + SIZES.sectionGap;
    const boardBottom = boardTop + CONTENT_WIDTH;
    const choicesTop = boardBottom + SIZES.sectionGap;
    const footerTop =
        choicesTop +
        choicesHeight +
        (choices.length > 0 ? SIZES.sectionGap : 0);

    canvas.height = footerTop + SIZES.footer + MARGIN;
    context.imageSmoothingQuality = 'high';
    context.textBaseline = 'top';

    context.fillStyle = COLORS.paper;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Header: logo on the left, the board name and date on the right.
    const headerHalf = CONTENT_WIDTH / 2 - 24;

    if (logo && logo.naturalHeight > 0) {
        const logoWidth = Math.min(
            (logo.naturalWidth / logo.naturalHeight) * SIZES.logoHeight,
            headerHalf,
        );
        const logoHeight = (logoWidth / logo.naturalWidth) * logo.naturalHeight;

        context.drawImage(
            logo,
            MARGIN,
            MARGIN + (SIZES.logoHeight - logoHeight) / 2,
            logoWidth,
            logoHeight,
        );
    } else {
        context.fillStyle = COLORS.brand;
        context.font = `60px "${DISPLAY_FONT}"`;
        context.fillText('HFJE', MARGIN, MARGIN + 12);
    }

    const headerTextHeight = SIZES.headerDateOffset + SIZES.headerDate;
    const headerTextTop = MARGIN + (SIZES.logoHeight - headerTextHeight) / 2;

    context.textAlign = 'right';
    context.fillStyle = COLORS.ink;
    context.font = `600 ${SIZES.headerTitle}px "${TEXT_FONT}"`;
    context.fillText(
        fitText(context, board.title.trim() || board.spaceName, headerHalf),
        WIDTH - MARGIN,
        headerTextTop,
    );
    context.fillStyle = COLORS.muted;
    context.font = `${SIZES.headerDate}px "${TEXT_FONT}"`;
    context.fillText(
        fitText(
            context,
            `The Living Edit · ${new Date().toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            })}`,
            headerHalf,
        ),
        WIDTH - MARGIN,
        headerTextTop + SIZES.headerDateOffset,
    );
    context.textAlign = 'left';

    // Board.
    drawBoard(
        context,
        { x: MARGIN, y: boardTop, width: CONTENT_WIDTH, height: CONTENT_WIDTH },
        [large, topRight, smallLeft, smallMiddle, smallRight],
    );

    // Choices, one column per step.
    choices.forEach((choice, index) => {
        const x = MARGIN + index * (columnWidth + SIZES.choiceColumnGap);

        context.fillStyle = COLORS.brand;
        context.font = `${SIZES.choiceLabel}px "${DISPLAY_FONT}"`;
        setLetterSpacing(context, '3px');
        context.fillText(
            fitText(context, choice.label.toUpperCase(), columnWidth),
            x,
            choicesTop,
        );
        setLetterSpacing(context, '0px');

        context.fillStyle = COLORS.ink;
        context.font = `${SIZES.choiceValue}px "${TEXT_FONT}"`;
        choiceLines[index].forEach((line, lineIndex) =>
            context.fillText(
                line,
                x,
                choicesTop +
                    SIZES.choiceLabel +
                    SIZES.choiceLabelGap +
                    lineIndex * SIZES.choiceValueLineHeight,
            ),
        );
    });

    // Footer.
    context.font = `${SIZES.footer}px "${TEXT_FONT}"`;
    const host = fitText(context, window.location.host, CONTENT_WIDTH * 0.4);
    const hostWidth = context.measureText(host).width;

    context.fillStyle = COLORS.muted;
    context.fillText(
        fitText(
            context,
            `Curated by HFJE for your ${board.spaceName.toLowerCase()}`,
            CONTENT_WIDTH - hostWidth - 48,
        ),
        MARGIN,
        footerTop,
    );
    context.textAlign = 'right';
    context.fillStyle = COLORS.brand;
    context.fillText(host, WIDTH - MARGIN, footerTop);

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
        .replace(/^-|-$/g, '')
        .slice(0, 60);
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
