import type { MotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type DayNightSceneProps = {
    daySrc: string;
    nightSrc: string;
    /** 0 = full daylight, 1 = full night. */
    progress: MotionValue<number>;
    /** Pointer offset from the centre of the scene, -0.5 to 0.5 on each axis. */
    pointerX: MotionValue<number>;
    pointerY: MotionValue<number>;
    /** Where the sun sits in the photo, as a 0–1 fraction from its top-left. */
    sun: [number, number];
    /** Called once both photos are on the GPU and the first frame is drawn. */
    onReady?: () => void;
    className?: string;
};

const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
out vec2 vUv;

void main() {
    // Top-left origin, so the shader thinks in the same space as the photo.
    vUv = vec2(aPosition.x * 0.5 + 0.5, 0.5 - aPosition.y * 0.5);
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uDay;
uniform sampler2D uNight;
uniform vec2 uResolution;
uniform float uImageAspect;
uniform vec2 uSun;
uniform vec2 uPointer;
uniform float uProgress;
uniform float uTime;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
    );
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p *= 2.03;
        amplitude *= 0.5;
    }

    return value;
}

vec3 sampleSplit(sampler2D image, vec2 uv, vec2 push) {
    // Each colour channel bends a little differently through the dusk front,
    // the way light splits at the edge of a lens.
    return vec3(
        texture(image, uv + push * 1.3).r,
        texture(image, uv + push).g,
        texture(image, uv + push * 0.7).b
    );
}

void main() {
    // Same framing as CSS object-fit: cover.
    float canvasAspect = uResolution.x / uResolution.y;
    vec2 cover = canvasAspect > uImageAspect
        ? vec2(1.0, uImageAspect / canvasAspect)
        : vec2(canvasAspect / uImageAspect, 1.0);
    vec2 uv = (vUv - 0.5) * cover + 0.5;

    // The room recedes from the floor at the bottom of the frame up to the
    // skyline, so nearer pixels slide further with the pointer than far ones.
    float depth = pow(clamp(uv.y, 0.0, 1.0), 1.4);
    uv += uPointer * (0.004 + 0.022 * depth);

    // Dusk rolls out from the sun as a ragged, drifting front.
    vec2 fromSun = (uv - uSun) * vec2(uImageAspect, 1.0);
    float distanceFromSun = length(fromSun);
    float grain = fbm(uv * vec2(uImageAspect, 1.0) * 3.2 + uTime * 0.04);
    float edge = distanceFromSun + (grain - 0.5) * 0.3;
    float radius = uProgress * 2.75 - 0.2;
    float night = smoothstep(radius, radius - 0.38, edge);
    float front = 4.0 * night * (1.0 - night);

    // The front refracts the room as it passes, pushing it away from the sun.
    vec2 direction = fromSun / max(distanceFromSun, 0.0001);
    direction.x /= uImageAspect;
    vec2 push = direction * front * 0.022;

    vec3 color = mix(
        sampleSplit(uDay, uv, push),
        sampleSplit(uNight, uv, push),
        night
    );
    // Last light: an amber rim riding the leading edge.
    color += vec3(1.0, 0.58, 0.22) * front * front * 0.28;

    fragColor = vec4(color, 1.0);
}
`;

function compile(
    gl: WebGL2RenderingContext,
    type: number,
    source: string,
): WebGLShader | null {
    const shader = gl.createShader(type);

    if (!shader) {
        return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);

        return null;
    }

    return shader;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });
}

/**
 * A day photo and a night photo of the same room, blended on the GPU: night
 * rolls out from the sun as a refracting, amber-rimmed front, and the room
 * shifts in depth with the pointer. It only draws while on screen, starts
 * fetching its photos the first time it is, and stays invisible where WebGL2
 * is unavailable so whatever sits beneath it shows through instead.
 */
export default function DayNightScene({
    daySrc,
    nightSrc,
    progress,
    pointerX,
    pointerY,
    sun,
    onReady,
    className,
}: DayNightSceneProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState(false);
    const [sunX, sunY] = sun;

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas?.getContext('webgl2', {
            antialias: false,
            alpha: false,
            powerPreference: 'high-performance',
        });

        if (!canvas || !gl) {
            return;
        }

        const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
        const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        const program = gl.createProgram();

        if (!vertex || !fragment || !program) {
            return;
        }

        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            return;
        }

        gl.useProgram(program);

        // One triangle covering the viewport; the fragment shader does the rest.
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 3, -1, -1, 3]),
            gl.STATIC_DRAW,
        );
        const position = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        const uniform = (name: string) => gl.getUniformLocation(program, name);
        const uResolution = uniform('uResolution');
        const uProgress = uniform('uProgress');
        const uPointer = uniform('uPointer');
        const uTime = uniform('uTime');
        gl.uniform1i(uniform('uDay'), 0);
        gl.uniform1i(uniform('uNight'), 1);
        gl.uniform2f(uniform('uSun'), sunX, sunY);

        const textures: WebGLTexture[] = [];

        const upload = (unit: number, image: HTMLImageElement) => {
            const texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_S,
                gl.CLAMP_TO_EDGE,
            );
            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_T,
                gl.CLAMP_TO_EDGE,
            );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                image,
            );
            textures.push(texture);
        };

        const reduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        let disposed = false;
        let loading = false;
        let loaded = false;
        let time = 0;
        let last = performance.now();
        let frame = 0;
        let onScreen = false;

        const draw = () => {
            gl.uniform1f(uProgress, progress.get());
            gl.uniform2f(uPointer, pointerX.get(), pointerY.get());
            gl.uniform1f(uTime, time);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        const resize = () => {
            // The photos are ~1700px wide, so extra device pixels buy nothing.
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
            const height = Math.max(1, Math.round(canvas.clientHeight * dpr));

            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                gl.viewport(0, 0, width, height);
                gl.uniform2f(uResolution, width, height);

                if (loaded) {
                    draw();
                }
            }
        };

        const tick = (now: number) => {
            if (!reduced) {
                time += (now - last) / 1000;
            }

            last = now;
            draw();
            frame = requestAnimationFrame(tick);
        };

        const start = () => {
            if (frame || !loaded) {
                return;
            }

            last = performance.now();
            frame = requestAnimationFrame(tick);
        };

        const stop = () => {
            cancelAnimationFrame(frame);
            frame = 0;
        };

        const load = () => {
            if (loading) {
                return;
            }

            loading = true;

            Promise.all([loadImage(daySrc), loadImage(nightSrc)])
                .then(([day, night]) => {
                    if (disposed) {
                        return;
                    }

                    upload(0, day);
                    upload(1, night);
                    gl.uniform1f(
                        uniform('uImageAspect'),
                        day.naturalWidth / day.naturalHeight,
                    );
                    loaded = true;
                    draw();
                    setReady(true);
                    onReady?.();

                    if (onScreen && !document.hidden) {
                        start();
                    }
                })
                .catch(() => {
                    // Leave the canvas hidden; the fallback beneath stays up.
                });
        };

        resize();

        const sizeObserver = new ResizeObserver(resize);
        sizeObserver.observe(canvas);

        // Idle while the scene is out of view — and never fetch the photos
        // at all on layouts where it is never shown.
        const viewObserver = new IntersectionObserver(
            ([entry]) => {
                onScreen = entry.isIntersecting;

                if (onScreen) {
                    load();
                    start();
                } else {
                    stop();
                }
            },
            { rootMargin: '150px' },
        );
        viewObserver.observe(canvas);

        const onVisibility = () => {
            if (document.hidden) {
                stop();
            } else if (onScreen) {
                start();
            }
        };
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            disposed = true;
            stop();
            sizeObserver.disconnect();
            viewObserver.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            textures.forEach((texture) => gl.deleteTexture(texture));
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
            gl.deleteShader(vertex);
            gl.deleteShader(fragment);
        };
    }, [daySrc, nightSrc, progress, pointerX, pointerY, sunX, sunY, onReady]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={cn(
                'pointer-events-none absolute inset-0 size-full transition-opacity duration-500 ease-out',
                ready ? 'opacity-100' : 'opacity-0',
                className,
            )}
        />
    );
}
