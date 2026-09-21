import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
out vec2 vUv;

void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

/**
 * Folded-silk pattern: a sine field warped by a second, slower one, dusted
 * with grain. Ported from the React Bits "Silk" shader, minus three.js — it
 * only ever needed a full-screen quad.
 */
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;
uniform vec2 uAspect;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
    float G = e;
    vec2 r = (G * sin(G * texCoord));
    return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    mat2 rot = mat2(c, -s, s, c);
    return rot * uv;
}

void main() {
    float rnd = noise(gl_FragCoord.xy);
    vec2 uv = rotateUvs(vUv * uAspect * uScale, uRotation);
    vec2 tex = uv * uScale;
    float tOffset = uSpeed * uTime;

    tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

    float pattern = 0.6 +
        0.4 * sin(5.0 * (tex.x + tex.y +
                         cos(3.0 * tex.x + 5.0 * tex.y) +
                         0.02 * tOffset) +
                  sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

    float grain = rnd / 15.0 * uNoiseIntensity;
    vec3 result = uColor * pattern - vec3(grain);

    fragColor = vec4(clamp(result, 0.0, 1.0), 1.0);
}
`;

interface SilkBackgroundProps {
    /** Hex colour the folds are tinted with. */
    color?: string;
    speed?: number;
    scale?: number;
    /** Grain strength over the folds. */
    noiseIntensity?: number;
    /** Rotation of the weave, in radians. */
    rotation?: number;
    /** Placement and sizing — it fills whatever box it is given. */
    className?: string;
}

function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');

    return [
        parseInt(clean.slice(0, 2), 16) / 255,
        parseInt(clean.slice(2, 4), 16) / 255,
        parseInt(clean.slice(4, 6), 16) / 255,
    ];
}

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

/**
 * An animated silk weave, drawn on its own canvas behind whatever it sits
 * under. It only runs while it is on screen, holds a single still frame for
 * anyone who asked for less motion, and quietly renders nothing at all where
 * WebGL2 is unavailable.
 */
export default function SilkBackground({
    color = '#a65e3c',
    speed = 3,
    scale = 1.1,
    noiseIntensity = 1.2,
    rotation = 0.18,
    className,
}: SilkBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas?.getContext('webgl2', {
            antialias: false,
            alpha: false,
            powerPreference: 'low-power',
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
        gl.useProgram(program);

        // One quad covering the viewport; the fragment shader does the rest.
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
        const uTime = uniform('uTime');
        const uAspect = uniform('uAspect');
        gl.uniform3f(uniform('uColor'), ...hexToRgb(color));
        gl.uniform1f(uniform('uSpeed'), speed);
        gl.uniform1f(uniform('uScale'), scale);
        gl.uniform1f(uniform('uRotation'), rotation);
        gl.uniform1f(uniform('uNoiseIntensity'), noiseIntensity);

        let time = 0;
        let last = performance.now();
        let frame = 0;
        let onScreen = false;

        const draw = () => {
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        const resize = () => {
            // Two device pixels per CSS pixel is plenty for a soft gradient.
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
            const height = Math.max(1, Math.round(canvas.clientHeight * dpr));

            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                gl.viewport(0, 0, width, height);
                // Keep the weave square-ish however wide the footer gets.
                gl.uniform2f(uAspect, Math.max(1, width / height), 1);
                draw();
            }
        };

        const reduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        const tick = (now: number) => {
            time += ((now - last) / 1000) * 0.1;
            last = now;
            gl.uniform1f(uTime, time);
            draw();
            frame = requestAnimationFrame(tick);
        };

        const start = () => {
            if (frame || reduced) {
                return;
            }

            last = performance.now();
            frame = requestAnimationFrame(tick);
        };

        const stop = () => {
            cancelAnimationFrame(frame);
            frame = 0;
        };

        resize();
        draw();

        const sizeObserver = new ResizeObserver(resize);
        sizeObserver.observe(canvas);

        // Idle while the footer is out of view — no GPU work up the page.
        const viewObserver = new IntersectionObserver(
            ([entry]) => {
                onScreen = entry.isIntersecting;

                if (onScreen) {
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
            stop();
            sizeObserver.disconnect();
            viewObserver.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
            gl.deleteShader(vertex);
            gl.deleteShader(fragment);
        };
    }, [color, speed, scale, noiseIntensity, rotation]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={cn(
                'pointer-events-none absolute inset-0 size-full',
                className,
            )}
        />
    );
}
