// Easing + small math helpers. Everything is a pure function of time.

export type Pt = { x: number; y: number };

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number) => (b === a ? 0 : (v - a) / (b - a));

/** 0→1 progress of time `t` within the window [start, start+dur]. */
export const seg = (t: number, start: number, dur: number) => clamp((t - start) / dur);

export const ease = {
  linear: (t: number) => t,
  inQuad: (t: number) => t * t,
  outQuad: (t: number) => 1 - (1 - t) * (1 - t),
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  outQuint: (t: number) => 1 - Math.pow(1 - t, 5),
  in: (t: number) => t * t * t,
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  backOut: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  elasticOut: (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },
};

/** Deterministic hash → [0,1). Stable across frames. */
export function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const cubic = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
};

export type Curve = [Pt, Pt, Pt, Pt];
export const onCurve = (c: Curve, t: number) => cubic(c[0], c[1], c[2], c[3], t);

export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Gentle curve between two points, bowed perpendicular by `bend` (fraction of length). */
export function bow(a: Pt, b: Pt, bend = 0.2): Curve {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const nx = -dy * bend;
  const ny = dx * bend;
  return [a, { x: a.x + dx * 0.33 + nx, y: a.y + dy * 0.33 + ny }, { x: a.x + dx * 0.66 + nx, y: a.y + dy * 0.66 + ny }, b];
}

/** Steps a value at a low "frame rate" — used for hand-drawn "boil". */
export const boilStep = (time: number, fps = 8) => Math.floor(time * fps);
