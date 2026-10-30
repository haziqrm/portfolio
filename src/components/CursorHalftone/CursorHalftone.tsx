import { useEffect, useRef } from 'react';
import styles from './CursorHalftone.module.css';

/* Tuning: all distances are CSS px. */
const RING_RADIUS = 4; // the cursor itself (a solid dot)
const RING_RADIUS_HOVER = 7; // over links and buttons
const SPACING = 5; // halftone grid pitch
const CLEAR_RADIUS = 7; // no dots inside this (keeps the cursor dot readable)
const PEAK_RADIUS = 12; // distance where dots are largest
const FADE_RADIUS = 34; // dots have vanished by here
const MAX_DOT = 1.6; // largest dot radius
const SHAPE: 'dot' | 'square' = 'dot';
const FOLLOW = 0.25; // 0..1, how quickly the halftone catches up with the pointer

const smoothstep = (t: number) => {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
};

/** 0..1 dot size at distance d: clear centre, peak just outside the ring, soft falloff. */
const profile = (d: number, grow: number) => {
  const clear = CLEAR_RADIUS + grow;
  const peak = PEAK_RADIUS + grow;
  const fade = FADE_RADIUS + grow;
  return d < peak
    ? smoothstep((d - clear) / (peak - clear))
    : 1 - smoothstep((d - peak) / (fade - peak));
};

/**
 * Replaces the system cursor with a solid dot wrapped in a small halftone halo, drawn on one
 * canvas with a difference blend so both invert against whatever is underneath.
 * Desktop (fine pointer) only; the system cursor is left alone everywhere else.
 */
export function CursorHalftone() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pointer = { x: 0, y: 0 }; // the cursor dot sits exactly here
    const halo = { x: 0, y: 0 }; // the halftone trails slightly
    let alpha = 0;
    let targetAlpha = 0;
    let ring = RING_RADIUS;
    let targetRing = RING_RADIUS;
    let frame = 0;

    const draw = () => {
      frame = 0;
      halo.x += (pointer.x - halo.x) * FOLLOW;
      halo.y += (pointer.y - halo.y) * FOLLOW;
      alpha += (targetAlpha - alpha) * 0.2;
      ring += (targetRing - ring) * 0.25;

      ctx.clearRect(0, 0, width, height);
      if (alpha > 0.01) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff';

        const grow = ring - RING_RADIUS;
        const reach = FADE_RADIUS + grow;
        ctx.beginPath();
        const x0 = Math.floor((halo.x - reach) / SPACING) * SPACING;
        const y0 = Math.floor((halo.y - reach) / SPACING) * SPACING;
        for (let y = y0; y <= halo.y + reach; y += SPACING) {
          for (let x = x0; x <= halo.x + reach; x += SPACING) {
            const r = MAX_DOT * profile(Math.hypot(x - halo.x, y - halo.y), grow);
            if (r < 0.2) continue;
            if (SHAPE === 'square') {
              ctx.rect(x - r, y - r, r * 2, r * 2);
            } else {
              ctx.moveTo(x + r, y);
              ctx.arc(x, y, r, 0, Math.PI * 2);
            }
          }
        }
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, ring, 0, Math.PI * 2);
        ctx.fill();
      }

      const settling =
        Math.abs(pointer.x - halo.x) > 0.1 ||
        Math.abs(pointer.y - halo.y) > 0.1 ||
        Math.abs(targetAlpha - alpha) > 0.005 ||
        Math.abs(targetRing - ring) > 0.05;
      if (settling) frame = requestAnimationFrame(draw);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (alpha < 0.01) {
        // Appear where the pointer is instead of sliding in from the last position.
        halo.x = e.clientX;
        halo.y = e.clientY;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      targetAlpha = 1;
      const overInteractive =
        e.target instanceof Element && e.target.closest('a, button, [role="button"]') !== null;
      targetRing = overInteractive ? RING_RADIUS_HOVER : RING_RADIUS;
      schedule();
    };
    const onLeave = () => {
      targetAlpha = 0;
      schedule();
    };
    const onResize = () => {
      resize();
      schedule();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      root.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
