import { useEffect, useRef } from 'react';
import styles from './WaveBackdrop.module.css';

/* Tuning. Heights and amplitudes are fractions of the viewport height. */
const STRANDS = 28; // lines per ribbon; more = silkier sheet
const STEP = 14; // px between sampled points along each line
const SPEED = 0.00012; // overall animation speed (per ms)

interface Ribbon {
  base: number; // vertical centre
  amp: number; // main swell
  freq: number; // main wavelength (radians per px at 1920 wide)
  drift: number; // how fast the swell travels
  twist: number; // how far strands fan apart where the ribbon opens
  twistFreq: number;
  alpha: number;
}

const RIBBONS: Ribbon[] = [
  { base: 0.56, amp: 0.07, freq: 0.0021, drift: 1, twist: 0.05, twistFreq: 0.0016, alpha: 0.32 },
  {
    base: 0.62,
    amp: 0.05,
    freq: 0.0029,
    drift: -0.7,
    twist: 0.035,
    twistFreq: 0.0023,
    alpha: 0.22,
  },
];

/**
 * Faint light ribbons drifting across the white page, drawn on a canvas behind the content.
 * Each ribbon is a stack of thin lines that fan apart and pinch together as it twists, which
 * reads as a translucent sheet. Fades in when `active` and stops drawing when hidden. With
 * reduced motion it draws a single still frame.
 */
export function WaveBackdrop({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !active) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const colour = getComputedStyle(canvas).getPropertyValue('--color-wave').trim() || '#fff';

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // y of strand `s` (-1..1 across the ribbon) at x, time t.
    const strandY = (r: Ribbon, s: number, x: number, t: number) => {
      const fx = (x / width) * 1920; // keep wavelengths constant across screen sizes
      const swell =
        Math.sin(fx * r.freq + t * r.drift) * r.amp +
        Math.sin(fx * r.freq * 0.47 - t * r.drift * 0.6 + 1.3) * r.amp * 0.6;
      const open = Math.sin(fx * r.twistFreq + t * 0.8 * r.drift + 0.5) * r.twist;
      return (r.base + swell + s * open) * height;
    };

    const draw = (time: number) => {
      const t = time * SPEED * 10;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = colour;
      ctx.fillStyle = colour;
      ctx.lineWidth = 1;

      for (const r of RIBBONS) {
        // Faint glow filling the sheet between its outermost strands.
        ctx.globalAlpha = r.alpha * 0.12;
        ctx.beginPath();
        for (let x = -STEP; x <= width + STEP; x += STEP) ctx.lineTo(x, strandY(r, -1, x, t));
        for (let x = width + STEP; x >= -STEP; x -= STEP) ctx.lineTo(x, strandY(r, 1, x, t));
        ctx.closePath();
        ctx.fill();

        // The strands, brightest at the edges of the sheet.
        for (let i = 0; i < STRANDS; i++) {
          const s = (i / (STRANDS - 1)) * 2 - 1;
          ctx.globalAlpha = r.alpha * (0.25 + 0.75 * s * s);
          ctx.beginPath();
          for (let x = -STEP; x <= width + STEP; x += STEP) {
            const y = strandY(r, s, x, t);
            if (x === -STEP) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    let frame = 0;
    const loop = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!still && !frame && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onResize = () => {
      resize();
      draw(performance.now());
    };

    resize();
    draw(performance.now());
    start();
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active]);

  return (
    <div className={styles.backdrop} data-active={active} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
