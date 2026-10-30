import { useEffect } from 'react';
import { layoutRect } from '../utils/layoutRect';

/* Tuning (ratios are of the viewport width, so the look holds at every size) */
const PERSPECTIVE = 0.75; // camera distance; smaller = stronger foreshortening
const CURVE_RADIUS = 1.0; // radius of the curved screen; smaller = stronger resting bend
const MAX_TILT = 26; // degrees; cap on how far any block turns
const VERTICAL_TILT = 0.6; // vertical bend relative to horizontal
const VIEW_FOLLOW = 0.5; // 0..1, how far the viewpoint moves from screen centre toward the mouse
const NEAR_SCALE = 1.02; // blocks at (or under) the pointer
const FAR_SCALE = 0.94; // blocks at REACH or beyond
const FAR_OPACITY = 0.82;
const REACH = 0.55; // fraction of the viewport diagonal over which near/far falls off
const EASE = 0.1; // 0..1 per frame

interface Block {
  el: HTMLElement;
  /** Untransformed layout centre and half-size, in viewport px. */
  cx: number;
  cy: number;
  halfW: number;
  halfH: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/**
 * On-screen width of a block of half-width `halfW` after rotateY(`angle`) and projection with
 * perspective `p`, when its centre sits `offset` px from the vanishing point. The edge turned
 * toward the viewer is magnified, so this is usually wider than 2 * halfW.
 */
const projectedWidth = (halfW: number, angle: number, offset: number, p: number) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const edge = (x: number) => ((offset + x * cos) * p) / (p + x * sin);
  return edge(halfW) - edge(-halfW);
};

/** Horizontal squeeze (applied before rotation) that keeps the on-screen width unchanged. */
const widthCompensation = (halfW: number, angle: number, offset: number, p: number) => {
  let squeeze = 1;
  for (let i = 0; i < 3; i++) {
    squeeze *= (2 * halfW) / projectedWidth(halfW * squeeze, angle, offset, p);
  }
  return squeeze;
};

/**
 * Curved-HUD effect for elements marked `data-depth`. All blocks share one viewpoint (screen
 * centre, pulled partway toward the mouse) and are turned to face it, as if mounted on a
 * concave screen, so they foreshorten into real trapezoids: the edge nearer the viewer looks
 * taller. The curve is there even at rest; moving the mouse shifts the viewpoint and deepens
 * it. Near/far depth comes from scaling each block about its own centre, never from moving it
 * in z, so blocks can't drift sideways over the portrait. Writes styles in a rAF loop (no
 * React re-renders). Desktop, fine pointer and motion allowed only. `pageKey` re-collects the
 * blocks when the page changes.
 */
export function useHudDepth(pageKey: string) {
  useEffect(() => {
    const allowed = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)',
    );
    if (!allowed.matches) return;

    const blocks: Block[] = Array.from(document.querySelectorAll<HTMLElement>('[data-depth]')).map(
      (el) => ({ el, cx: 0, cy: 0, halfW: 0, halfH: 0 }),
    );
    if (blocks.length === 0) return;

    // Measure layout boxes, ignoring transforms (ours, and the page transition's on ancestors),
    // so the effect never feeds back into itself.
    const measure = () => {
      for (const block of blocks) {
        const rect = layoutRect(block.el);
        block.cx = rect.cx;
        block.cy = rect.cy;
        block.halfW = rect.width / 2;
        block.halfH = rect.height / 2;
      }
    };

    let pointer: { x: number; y: number } | null = null;
    const focus = { x: window.innerWidth / 2, y: window.innerHeight / 2 }; // smoothed mouse
    let strength = 0; // 0 = resting curve only, 1 = mouse fully steering
    let frame = 0;

    const render = () => {
      const width = window.innerWidth;
      const centreX = width / 2;
      const centreY = window.innerHeight / 2;
      const perspective = width * PERSPECTIVE;
      const radius = width * CURVE_RADIUS;
      const reach = Math.hypot(width, window.innerHeight) * REACH;
      const follow = VIEW_FOLLOW * strength;
      const viewX = centreX + (focus.x - centreX) * follow;
      const viewY = centreY + (focus.y - centreY) * follow;

      for (const { el, cx, cy, halfW, halfH } of blocks) {
        // Face the viewpoint, like a panel on a concave screen.
        const toX = viewX - cx;
        const toY = viewY - cy;
        const rotateY = clamp(toDeg(Math.atan(toX / radius)), -MAX_TILT, MAX_TILT);
        const rotateX = -clamp(toDeg(Math.atan(toY / radius)) * VERTICAL_TILT, -MAX_TILT, MAX_TILT);

        // Closer to the mouse = slightly bigger and fully opaque.
        const gap = Math.hypot(
          Math.max(Math.abs(focus.x - cx) - halfW, 0),
          Math.max(Math.abs(focus.y - cy) - halfH, 0),
        );
        const near = 1 - smoothstep(gap / reach);
        const scale = 1 + (FAR_SCALE + (NEAR_SCALE - FAR_SCALE) * near - 1) * strength;
        const opacity = 1 - (1 - FAR_OPACITY) * (1 - near) * strength;

        // Perspective magnifies the edge turned toward the viewer, which reads as horizontal
        // stretching. Squeeze the block first so its on-screen width matches its layout width;
        // the taller-near-edge keystone that sells the bend is left almost untouched.
        const squeeze = widthCompensation(halfW, (rotateY * Math.PI) / 180, -toX, perspective);

        // translate → perspective → translate back puts the vanishing point on the viewpoint.
        el.style.transform =
          `translate(${toX}px, ${toY}px) perspective(${perspective}px) ` +
          `translate(${-toX}px, ${-toY}px) ` +
          `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scaleX(${squeeze}) scale(${scale})`;
        el.style.opacity = String(opacity);
      }
    };

    const tick = () => {
      frame = 0;
      const targetStrength = pointer ? 1 : 0;
      if (pointer) {
        focus.x += (pointer.x - focus.x) * EASE;
        focus.y += (pointer.y - focus.y) * EASE;
      }
      strength += (targetStrength - strength) * EASE;

      const settled =
        Math.abs(targetStrength - strength) < 0.001 &&
        (!pointer || (Math.abs(pointer.x - focus.x) < 0.1 && Math.abs(pointer.y - focus.y) < 0.1));
      if (settled) strength = targetStrength;

      render();
      if (!settled) frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (strength < 0.01) {
        // Start steering from where the pointer enters rather than sliding over from elsewhere.
        focus.x = e.clientX;
        focus.y = e.clientY;
      }
      pointer = { x: e.clientX, y: e.clientY };
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };
    const onResize = () => {
      measure();
      render();
    };

    // Show the resting curve straight away, before the mouse has moved.
    measure();
    render();

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      for (const { el } of blocks) {
        el.style.transform = '';
        el.style.opacity = '';
      }
    };
  }, [pageKey]);
}
