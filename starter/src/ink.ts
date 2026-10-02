// ─────────────────────────────────────────────────────────────
//  The "riso" ink kit.
//  A limited palette of spot inks, halftone screens, slightly
//  misregistered outlines, rubber stamps and paper grain.
//  Everything is drawn in a fixed 1920×1080 stage space.
// ─────────────────────────────────────────────────────────────
import { logo, LOGO_INITIAL, type LogoKey } from './logos';
import { mulberry32, type Pt, type Curve, onCurve, boilStep, hash } from './motion';

export type Ctx = CanvasRenderingContext2D;

export const W = 1920;
export const H = 1080;

export const INK = {
  paper: '#f4ecdc',
  paper2: '#ebe0c9',
  card: '#fffaf0',
  navy: '#1c1f4a',
  blue: '#3a4bff',
  coral: '#ff6b4a',
  lime: '#d4f542',
  grey: '#9c98a6',
  fx: '#00a1de', // ExampleCo cyan — used only for ExampleCo-side elements
  fxNavy: '#00549f',
} as const;

export const FONT = {
  display: "'Bricolage Grotesque', 'DM Sans', system-ui, sans-serif",
  sans: "'DM Sans', system-ui, sans-serif",
  mono: "'DM Mono', ui-monospace, monospace",
};

// ── Global "boil": hand-drawn jitter that steps at 8fps ─────────
let boilT = 0;
export function setBoilTime(t: number) {
  boilT = t;
}
/** Small, stepped offset used for misregistration. */
export function mis(seed = 0, amt = 1): Pt {
  const s = boilStep(boilT, 6) * 13.37 + seed * 7.1;
  return { x: (1.6 + (hash(s) - 0.5) * 1.4) * amt, y: (1.3 + (hash(s + 3.3) - 0.5) * 1.4) * amt };
}

// ── Halftone screens ───────────────────────────────────────────
const halftoneCache = new Map<string, CanvasPattern>();

/** A rotated dot screen. level 0..1 = dot coverage. */
export function halftone(ctx: Ctx, color: string, level = 0.5, cell = 9, angle = 45): CanvasPattern {
  const key = `${color}|${level.toFixed(2)}|${cell}|${angle}`;
  const cached = halftoneCache.get(key);
  if (cached) return cached;
  const S = 2; // supersample tile
  const c = document.createElement('canvas');
  c.width = c.height = cell * S;
  const g = c.getContext('2d')!;
  g.fillStyle = color;
  const r = Math.sqrt(level) * cell * 0.58 * S;
  const m = cell * S;
  for (const [x, y] of [[0, 0], [m, 0], [0, m], [m, m], [m / 2, m / 2]]) {
    g.beginPath();
    g.arc(x, y, r * (x === m / 2 ? 1 : 1), 0, Math.PI * 2);
    g.fill();
  }
  const p = ctx.createPattern(c, 'repeat')!;
  p.setTransform(new DOMMatrix().rotate(angle).scale(1 / S));
  halftoneCache.set(key, p);
  return p;
}

// ── Paths ──────────────────────────────────────────────────────
export function circlePath(ctx: Ctx, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
}

export function rrPath(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  const rr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Organic, slightly lumpy circle. `seed` keeps it stable; `wob` 0..1. */
export function blobPath(ctx: Ctx, x: number, y: number, r: number, seed = 1, wob = 0.05, time = 0) {
  ctx.beginPath();
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k =
      1 +
      wob *
        (Math.sin(a * 3 + seed * 1.7 + time * 0.9) * 0.55 +
          Math.sin(a * 5 + seed * 3.1 - time * 0.6) * 0.3 +
          Math.sin(a * 2 + seed * 0.3 + time * 0.4) * 0.35);
    const px = x + Math.cos(a) * r * k;
    const py = y + Math.sin(a) * r * k;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// ── Ink fills ──────────────────────────────────────────────────
type InkOpts = {
  color?: string;
  alpha?: number;
  flat?: number; // opacity of a flat base fill
  tone?: { color?: string; level?: number; cell?: number; angle?: number; alpha?: number };
  blend?: GlobalCompositeOperation;
};

/** Fill the current path like a riso layer: flat ink (multiply) + optional halftone. */
export function ink(ctx: Ctx, o: InkOpts) {
  ctx.save();
  const __ga = ctx.globalAlpha;
  ctx.globalCompositeOperation = o.blend ?? 'multiply';
  const a = o.alpha ?? 1;
  if (o.flat !== undefined && o.flat > 0 && o.color) {
    ctx.globalAlpha = __ga * (a * o.flat);
    ctx.fillStyle = o.color;
    ctx.fill();
  }
  if (o.tone) {
    ctx.globalAlpha = __ga * (a * (o.tone.alpha ?? 1));
    ctx.fillStyle = halftone(ctx, o.tone.color ?? o.color ?? INK.navy, o.tone.level ?? 0.35, o.tone.cell ?? 9, o.tone.angle ?? 45);
    ctx.fill();
  }
  ctx.restore();
}

/** Stroke current path with a misregistered double: offset colour first, then key ink. */
export function outline(ctx: Ctx, o: { color?: string; width?: number; alpha?: number; offColor?: string; seed?: number; dash?: number[]; dashOffset?: number } = {}) {
  ctx.save();
  const __ga = ctx.globalAlpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = o.width ?? 3;
  if (o.dash) {
    ctx.setLineDash(o.dash);
    ctx.lineDashOffset = o.dashOffset ?? 0;
  }
  const a = o.alpha ?? 1;
  if (o.offColor) {
    const m = mis(o.seed ?? 0);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = __ga * (a * 0.75);
    ctx.strokeStyle = o.offColor;
    ctx.translate(m.x, m.y);
    ctx.stroke();
    ctx.translate(-m.x, -m.y);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = __ga * (a);
  ctx.strokeStyle = o.color ?? INK.navy;
  ctx.stroke();
  ctx.restore();
}

/** Solid paper-coloured (opaque) fill of current path. */
export function paperFill(ctx: Ctx, color: string = INK.card, alpha = 1) {
  ctx.save();
  const __ga = ctx.globalAlpha;
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = __ga * (alpha);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

// ── Lines & curves ─────────────────────────────────────────────
export function curvePath(ctx: Ctx, c: Curve, from = 0, to = 1) {
  ctx.beginPath();
  if (from <= 0 && to >= 1) {
    ctx.moveTo(c[0].x, c[0].y);
    ctx.bezierCurveTo(c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y);
    return;
  }
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const t = from + (to - from) * (i / n);
    const p = onCurve(c, t);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
}

export function arrowHead(ctx: Ctx, p: Pt, angle: number, size: number, color: string, alpha = 1) {
  ctx.save();
  const __ga = ctx.globalAlpha;
  ctx.globalAlpha = __ga * (alpha);
  ctx.translate(p.x, p.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size * 0.6);
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, size * 0.6);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

// ── Text ───────────────────────────────────────────────────────
type TextOpts = {
  size?: number;
  weight?: number | string;
  family?: string;
  color?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  alpha?: number;
  spacing?: number;
  offColor?: string; // riso misregistration shadow
  offAmt?: number;
  maxWidth?: number;
};

export function setFont(ctx: Ctx, size: number, weight: number | string = 500, family = FONT.sans) {
  ctx.font = `${weight} ${size}px ${family}`;
}

export function text(ctx: Ctx, s: string, x: number, y: number, o: TextOpts = {}) {
  ctx.save();
  const __ga = ctx.globalAlpha;
  setFont(ctx, o.size ?? 20, o.weight ?? 500, o.family ?? FONT.sans);
  ctx.textAlign = o.align ?? 'left';
  ctx.textBaseline = o.baseline ?? 'alphabetic';
  if (o.spacing) (ctx as any).letterSpacing = `${o.spacing}px`;
  const a = o.alpha ?? 1;
  if (o.offColor) {
    const m = mis(x * 0.01 + y * 0.013, o.offAmt ?? 1.4);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = __ga * (a * 0.9);
    ctx.fillStyle = o.offColor;
    ctx.fillText(s, x + m.x, y + m.y, o.maxWidth);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = __ga * (a);
  ctx.fillStyle = o.color ?? INK.navy;
  ctx.fillText(s, x, y, o.maxWidth);
  ctx.restore();
}

export function measure(ctx: Ctx, s: string, size: number, weight: number | string = 500, family = FONT.sans, spacing = 0) {
  ctx.save();
  setFont(ctx, size, weight, family);
  if (spacing) (ctx as any).letterSpacing = `${spacing}px`;
  const w = ctx.measureText(s).width;
  ctx.restore();
  return w;
}

export function wrap(ctx: Ctx, s: string, maxW: number, size: number, weight: number | string = 500, family = FONT.sans): string[] {
  ctx.save();
  setFont(ctx, size, weight, family);
  const words = s.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  ctx.restore();
  return lines;
}

export function fit(ctx: Ctx, s: string, maxW: number, size: number, weight: number | string = 500, family = FONT.sans) {
  if (measure(ctx, s, size, weight, family) <= maxW) return s;
  let t = s;
  while (t.length > 1 && measure(ctx, t + '…', size, weight, family) > maxW) t = t.slice(0, -1);
  return t + '…';
}

/** Typewriter across wrapped lines. `n` = characters shown. Left-aligned from `x`, or centred by full line width. */
export function typedLines(
  ctx: Ctx,
  lines: string[],
  n: number,
  x: number,
  y: number,
  lh: number,
  o: TextOpts & { center?: boolean } = {},
) {
  let left = Math.floor(n);
  lines.forEach((line, i) => {
    if (left <= 0) return;
    const shown = line.slice(0, left);
    left -= line.length + 1;
    let lx = x;
    if (o.center) lx = x - measure(ctx, line, o.size ?? 20, o.weight ?? 500, o.family ?? FONT.sans) / 2;
    text(ctx, shown, lx, y + i * lh, { ...o, align: 'left' });
  });
}

// ── Logos ──────────────────────────────────────────────────────
export function drawLogo(ctx: Ctx, key: LogoKey, cx: number, cy: number, size: number, alpha = 1) {
  const img = logo(key);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.globalCompositeOperation = 'source-over';
  if (img) {
    const iw = img.naturalWidth || 1;
    const ih = img.naturalHeight || 1;
    const k = size / Math.max(iw, ih);
    const w = iw * k;
    const h = ih * k;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  } else {
    text(ctx, LOGO_INITIAL[key], cx, cy, { size: size * 0.5, weight: 700, align: 'center', baseline: 'middle', color: INK.navy });
  }
  ctx.restore();
}

// ── Composite pieces ───────────────────────────────────────────

/** Round app "sticker": white disc, halftone offset shadow, logo. */
export function sticker(ctx: Ctx, key: LogoKey, x: number, y: number, r: number, o: { alpha?: number; scale?: number; shadow?: string; ring?: string; seed?: number } = {}) {
  const s = o.scale ?? 1;
  if (s <= 0.001) return;
  ctx.save();
  const __ga = ctx.globalAlpha;
  ctx.globalAlpha = __ga * (o.alpha ?? 1);
  ctx.translate(x, y);
  ctx.scale(s, s);
  circlePath(ctx, 6, 7, r);
  ink(ctx, { tone: { color: o.shadow ?? INK.blue, level: 0.5, cell: 6 } });
  circlePath(ctx, 0, 0, r);
  paperFill(ctx, INK.card);
  outline(ctx, { width: 3, offColor: INK.coral, seed: o.seed ?? x });
  if (o.ring) {
    circlePath(ctx, 0, 0, r + 9);
    outline(ctx, { width: 4, color: o.ring });
  }
  drawLogo(ctx, key, 0, 0, r * 1.05);
  ctx.restore();
}

export type CardOpts = {
  w?: number;
  h?: number;
  logo?: LogoKey;
  title: string;
  meta?: string;
  rot?: number;
  scale?: number;
  alpha?: number;
  shadow?: string;
  titleSize?: number;
  dim?: number;
  ring?: string;
  seed?: number;
  noMeta?: boolean;
};

/** A paper document card, centred at (x, y). */
export function card(ctx: Ctx, x: number, y: number, o: CardOpts) {
  const w = o.w ?? 300;
  const h = o.h ?? 76;
  const s = o.scale ?? 1;
  if (s <= 0.001 || (o.alpha ?? 1) <= 0.001) return;
  ctx.save();
  const __ga = ctx.globalAlpha;
  ctx.globalAlpha = __ga * (o.alpha ?? 1);
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  ctx.scale(s, s);
  const x0 = -w / 2;
  const y0 = -h / 2;
  // halftone shadow block
  rrPath(ctx, x0 + 7, y0 + 8, w, h, 12);
  ink(ctx, { tone: { color: o.shadow ?? INK.navy, level: 0.42, cell: 6 } });
  // body
  rrPath(ctx, x0, y0, w, h, 12);
  paperFill(ctx, INK.card);
  if (o.ring) {
    rrPath(ctx, x0 - 7, y0 - 7, w + 14, h + 14, 17);
    outline(ctx, { width: 5, color: o.ring });
  }
  rrPath(ctx, x0, y0, w, h, 12);
  outline(ctx, { width: 2.5, offColor: o.ring ? undefined : INK.blue, seed: o.seed ?? x + y });
  // logo
  const pad = Math.min(16, h * 0.22);
  const ls = Math.min(h - pad * 2, 40);
  let tx = x0 + pad;
  if (o.logo) {
    drawLogo(ctx, o.logo, x0 + pad + ls / 2, 0, ls);
    tx = x0 + pad + ls + 12;
  }
  const ts = o.titleSize ?? Math.min(20, h * 0.27);
  const maxW = w / 2 - tx - pad;
  const hasMeta = !!o.meta && !o.noMeta;
  text(ctx, fit(ctx, o.title, x0 + w - pad - tx, ts, 700), tx, hasMeta ? -ts * 0.15 : ts * 0.35, { size: ts, weight: 700 });
  if (hasMeta) text(ctx, fit(ctx, o.meta!, x0 + w - pad - tx, ts * 0.72, 400, FONT.mono), tx, ts * 1.05, { size: ts * 0.72, family: FONT.mono, color: INK.navy, alpha: 0.62 });
  void maxW;
  if (o.dim && o.dim > 0) {
    rrPath(ctx, x0 - 2, y0 - 2, w + 14, h + 14, 13);
    paperFill(ctx, INK.paper, o.dim * 0.72);
  }
  ctx.restore();
}

/** Metrics of a card's text column, for placing chips where meta sits. */
export function cardTextX(w: number, h: number, hasLogo = true) {
  const pad = Math.min(16, h * 0.22);
  const ls = Math.min(h - pad * 2, 40);
  return -w / 2 + pad + (hasLogo ? ls + 12 : 0);
}

/** Pill label. Returns its width. */
export function chip(
  ctx: Ctx,
  s: string,
  x: number,
  y: number,
  o: { bg?: string; fg?: string; size?: number; align?: 'left' | 'center' | 'right'; alpha?: number; scale?: number; border?: string; mono?: boolean; padX?: number; weight?: number } = {},
) {
  const size = o.size ?? 16;
  const fam = o.mono === false ? FONT.sans : FONT.mono;
  const wt = o.weight ?? 500;
  const tw = measure(ctx, s, size, wt, fam);
  const px = o.padX ?? size * 0.75;
  const w = tw + px * 2;
  const h = size * 1.9;
  const sc = o.scale ?? 1;
  if (sc <= 0.001) return w;
  let x0 = x;
  if ((o.align ?? 'left') === 'center') x0 = x - w / 2;
  if (o.align === 'right') x0 = x - w;
  ctx.save();
  const __ga = ctx.globalAlpha;
  ctx.globalAlpha = __ga * (o.alpha ?? 1);
  ctx.translate(x0 + w / 2, y);
  ctx.scale(sc, sc);
  rrPath(ctx, -w / 2, -h / 2, w, h, h / 2);
  paperFill(ctx, o.bg ?? INK.card);
  rrPath(ctx, -w / 2, -h / 2, w, h, h / 2);
  outline(ctx, { width: 2, color: o.border ?? INK.navy });
  text(ctx, s, 0, 1, { size, family: fam, weight: wt, color: o.fg ?? INK.navy, align: 'center', baseline: 'middle' });
  ctx.restore();
  return w;
}

// ── Rubber stamps (pre-rendered with ink wear) ─────────────────
const stampCache = new Map<string, HTMLCanvasElement>();

function buildStamp(label: string, sub: string | undefined, color: string, size: number): HTMLCanvasElement {
  const key = `${label}|${sub}|${color}|${size}`;
  const hit = stampCache.get(key);
  if (hit) return hit;
  const S = 2;
  const tmp = document.createElement('canvas').getContext('2d')!;
  const tw = measure(tmp, label, size, 800, FONT.display, size * 0.04);
  const sw = sub ? measure(tmp, sub, size * 0.36, 500, FONT.mono, 1.5) : 0;
  const pw = size * 0.55;
  const w = Math.max(tw, sw) + pw * 2;
  const h = size * (sub ? 1.95 : 1.45);
  const c = document.createElement('canvas');
  c.width = Math.ceil((w + 20) * S);
  c.height = Math.ceil((h + 20) * S);
  const g = c.getContext('2d')!;
  g.scale(S, S);
  g.translate(10, 10);
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = size * 0.085;
  rrPath(g, 0, 0, w, h, size * 0.22);
  g.stroke();
  g.lineWidth = size * 0.03;
  rrPath(g, size * 0.12, size * 0.12, w - size * 0.24, h - size * 0.24, size * 0.14);
  g.stroke();
  setFont(g, size, 800, FONT.display);
  (g as any).letterSpacing = `${size * 0.04}px`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(label, w / 2, sub ? h * 0.4 : h / 2 + size * 0.04);
  if (sub) {
    setFont(g, size * 0.36, 500, FONT.mono);
    (g as any).letterSpacing = '1.5px';
    g.fillText(sub, w / 2, h * 0.76);
  }
  // wear: knock out speckles & scratches
  g.globalCompositeOperation = 'destination-out';
  const rnd = mulberry32(label.length * 97 + size);
  for (let i = 0; i < (w * h) / 55; i++) {
    g.globalAlpha = 0.35 + rnd() * 0.65;
    g.beginPath();
    g.arc(rnd() * w, rnd() * h, rnd() * 1.5 + 0.3, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 0.5;
  g.lineWidth = 1.2;
  for (let i = 0; i < 7; i++) {
    const sx = rnd() * w;
    const sy = rnd() * h;
    g.beginPath();
    g.moveTo(sx, sy);
    g.lineTo(sx + (rnd() - 0.5) * 60, sy + (rnd() - 0.5) * 8);
    g.stroke();
  }
  stampCache.set(key, c);
  return c;
}

/** Slam-in rubber stamp. p = 0..1 appear progress. */
export function stamp(ctx: Ctx, label: string, x: number, y: number, o: { sub?: string; color?: string; size?: number; rot?: number; p?: number; alpha?: number; scrim?: boolean } = {}) {
  const p = o.p ?? 1;
  if (p <= 0) return;
  const c = buildStamp(label, o.sub, o.color ?? INK.coral, o.size ?? 56);
  const w = c.width / 2;
  const h = c.height / 2;
  // slam: big & transparent → overshoot → settle
  const sc = p < 0.6 ? 1.9 - (p / 0.6) * 0.98 : 0.92 + Math.sin(((p - 0.6) / 0.4) * Math.PI) * 0.06 + ((p - 0.6) / 0.4) * 0.08;
  ctx.save();
  const __ga = ctx.globalAlpha;
  ctx.translate(x, y);
  ctx.rotate(o.rot ?? -0.08);
  ctx.scale(sc, sc);
  if (o.scrim) {
    ctx.globalAlpha = __ga * ((o.alpha ?? 1) * Math.min(1, p * 2.2) * 0.9);
    rrPath(ctx, -w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 18);
    ctx.fillStyle = INK.paper;
    ctx.fill();
  }
  ctx.globalAlpha = __ga * ((o.alpha ?? 1) * Math.min(1, p * 2.2) * 0.93);
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(c, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// ── Little glyphs ──────────────────────────────────────────────
export function glyph(ctx: Ctx, kind: 'check' | 'cross' | 'lock' | 'clock' | 'eye' | 'people' | 'spark', x: number, y: number, s: number, color: string = INK.navy, lw = 3) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  switch (kind) {
    case 'check':
      ctx.moveTo(-s * 0.5, 0);
      ctx.lineTo(-s * 0.12, s * 0.38);
      ctx.lineTo(s * 0.55, -s * 0.4);
      ctx.stroke();
      break;
    case 'cross':
      ctx.moveTo(-s * 0.42, -s * 0.42);
      ctx.lineTo(s * 0.42, s * 0.42);
      ctx.moveTo(s * 0.42, -s * 0.42);
      ctx.lineTo(-s * 0.42, s * 0.42);
      ctx.stroke();
      break;
    case 'lock':
      rrPath(ctx, -s * 0.5, -s * 0.1, s, s * 0.75, s * 0.14);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -s * 0.12, s * 0.3, Math.PI, 0);
      ctx.stroke();
      break;
    case 'clock':
      ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
      ctx.moveTo(0, -s * 0.28);
      ctx.lineTo(0, 0);
      ctx.lineTo(s * 0.22, s * 0.14);
      ctx.stroke();
      break;
    case 'eye':
      ctx.moveTo(-s * 0.55, 0);
      ctx.quadraticCurveTo(0, -s * 0.55, s * 0.55, 0);
      ctx.quadraticCurveTo(0, s * 0.55, -s * 0.55, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'people':
      ctx.arc(-s * 0.2, -s * 0.18, s * 0.17, 0, Math.PI * 2);
      ctx.moveTo(s * 0.4, -s * 0.12);
      ctx.arc(s * 0.25, -s * 0.12, s * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-s * 0.2, s * 0.42, s * 0.34, Math.PI, 0);
      ctx.arc(s * 0.27, s * 0.42, s * 0.27, Math.PI, 0);
      ctx.fill();
      break;
    case 'spark':
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.moveTo(Math.cos(a) * s * 0.15, Math.sin(a) * s * 0.15);
        ctx.lineTo(Math.cos(a) * s * 0.55, Math.sin(a) * s * 0.55);
      }
      ctx.stroke();
      break;
  }
  ctx.restore();
}

/** Round badge with a glyph or number. */
export function badge(ctx: Ctx, x: number, y: number, r: number, o: { bg: string; fg?: string; glyph?: 'check' | 'cross'; label?: string; scale?: number; alpha?: number }) {
  const s = o.scale ?? 1;
  if (s <= 0.001) return;
  ctx.save();
  const __ga = ctx.globalAlpha;
  ctx.globalAlpha = __ga * (o.alpha ?? 1);
  ctx.translate(x, y);
  ctx.scale(s, s);
  circlePath(ctx, 3, 4, r);
  ink(ctx, { color: INK.navy, flat: 0.9 });
  circlePath(ctx, 0, 0, r);
  paperFill(ctx, o.bg);
  circlePath(ctx, 0, 0, r);
  outline(ctx, { width: 2.5 });
  if (o.glyph) glyph(ctx, o.glyph, 0, 0, r * 0.95, o.fg ?? INK.navy, Math.max(2.5, r * 0.18));
  if (o.label) text(ctx, o.label, 0, 1, { size: r * 1.05, weight: 800, family: FONT.display, align: 'center', baseline: 'middle', color: o.fg ?? INK.navy });
  ctx.restore();
}

// ── People ─────────────────────────────────────────────────────
export type PersonStyle = { shirt: string; hair: 'bun' | 'long' | 'short' | 'curly'; hairColor?: string; seed?: number };

/** A small riso-illustrated bust. (x, y) = bottom-centre. Height ≈ 2.1·s. */
export function person(ctx: Ctx, x: number, y: number, s: number, st: PersonStyle, o: { scale?: number; time?: number; alpha?: number } = {}) {
  const sc = o.scale ?? 1;
  if (sc <= 0.001) return;
  const bob = Math.sin((o.time ?? 0) * 1.6 + (st.seed ?? 0)) * s * 0.02;
  const hair = st.hairColor ?? INK.navy;
  ctx.save();
  const __ga = ctx.globalAlpha;
  ctx.globalAlpha = __ga * (o.alpha ?? 1);
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  ctx.translate(0, bob);
  const hx = 0;
  const hy = -s * 1.35;
  const hr = s * 0.42;
  // back hair
  if (st.hair === 'long' || st.hair === 'bun' || st.hair === 'curly') {
    ctx.beginPath();
    if (st.hair === 'long') {
      ctx.ellipse(hx, hy + hr * 0.15, hr * 1.2, hr * 1.25, 0, 0, Math.PI * 2);
    } else if (st.hair === 'curly') {
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + (i / 8) * Math.PI;
        ctx.moveTo(hx + Math.cos(a) * hr * 0.95 + hr * 0.36, hy + Math.sin(a) * hr * 0.95);
        ctx.arc(hx + Math.cos(a) * hr * 0.95, hy + Math.sin(a) * hr * 0.95, hr * 0.36, 0, Math.PI * 2);
      }
    } else {
      ctx.arc(hx + hr * 0.1, hy - hr * 1.12, hr * 0.46, 0, Math.PI * 2);
    }
    ink(ctx, { color: hair, flat: 1 });
  }
  // body
  ctx.beginPath();
  ctx.moveTo(-s * 0.95, 0);
  ctx.bezierCurveTo(-s * 0.95, -s * 0.62, -s * 0.62, -s * 0.84, 0, -s * 0.84);
  ctx.bezierCurveTo(s * 0.62, -s * 0.84, s * 0.95, -s * 0.62, s * 0.95, 0);
  ctx.closePath();
  ink(ctx, { color: st.shirt, flat: 1, tone: { color: INK.navy, level: 0.22, cell: 7, alpha: 0.5 } });
  outline(ctx, { width: 2.5, alpha: 0.9 });
  // neck
  rrPath(ctx, -s * 0.13, -s * 1.02, s * 0.26, s * 0.24, s * 0.08);
  paperFill(ctx, '#f7d7c4');
  // head
  circlePath(ctx, hx, hy, hr);
  paperFill(ctx, '#f9dfcd');
  circlePath(ctx, hx, hy, hr);
  ink(ctx, { tone: { color: INK.coral, level: 0.12, cell: 6, alpha: 0.8 } });
  circlePath(ctx, hx, hy, hr);
  outline(ctx, { width: 2.5, offColor: INK.coral, seed: st.seed ?? 3 });
  // fringe
  ctx.beginPath();
  ctx.arc(hx, hy, hr * 1.02, Math.PI * 1.02, Math.PI * 1.98);
  if (st.hair === 'short') ctx.quadraticCurveTo(hx + hr * 0.2, hy - hr * 0.1, hx - hr * 0.95, hy - hr * 0.05);
  else ctx.quadraticCurveTo(hx - hr * 0.1, hy - hr * 0.5, hx - hr * 1.0, hy - hr * 0.1);
  ctx.closePath();
  ink(ctx, { color: hair, flat: 1 });
  // face
  ctx.fillStyle = INK.navy;
  circlePath(ctx, hx - hr * 0.33, hy + hr * 0.12, hr * 0.075);
  ctx.fill();
  circlePath(ctx, hx + hr * 0.33, hy + hr * 0.12, hr * 0.075);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hx, hy + hr * 0.3, hr * 0.22, Math.PI * 0.15, Math.PI * 0.85);
  ctx.strokeStyle = INK.navy;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.stroke();
  circlePath(ctx, hx - hr * 0.55, hy + hr * 0.42, hr * 0.14);
  ink(ctx, { color: INK.coral, flat: 0.45 });
  circlePath(ctx, hx + hr * 0.55, hy + hr * 0.42, hr * 0.14);
  ink(ctx, { color: INK.coral, flat: 0.45 });
  ctx.restore();
}

/** A soft radial halftone "sun" — big decorative disc. */
export function sun(ctx: Ctx, x: number, y: number, r: number, color: string, o: { alpha?: number; level?: number; cell?: number; angle?: number } = {}) {
  ctx.save();
  const __ga = ctx.globalAlpha;
  ctx.globalAlpha = __ga * (o.alpha ?? 1);
  const bands = 5;
  for (let i = 0; i < bands; i++) {
    const rr = r * (1 - i / bands);
    circlePath(ctx, x, y, rr);
    ink(ctx, { tone: { color, level: (o.level ?? 0.12) + i * 0.06, cell: o.cell ?? 10, angle: o.angle ?? 45, alpha: i === 0 ? 1 : 0.55 } });
  }
  ctx.restore();
}

// ── Paper ──────────────────────────────────────────────────────
let paperCanvas: HTMLCanvasElement | null = null;
let grainCanvas: HTMLCanvasElement | null = null;

export function buildPaper(scale: number) {
  const S = Math.min(2, Math.max(1, scale));
  const rnd = mulberry32(42);
  // base paper
  const c = document.createElement('canvas');
  c.width = W * S;
  c.height = H * S;
  const g = c.getContext('2d')!;
  g.scale(S, S);
  g.fillStyle = INK.paper;
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const r = 120 + rnd() * 380;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    const dark = rnd() > 0.5;
    grd.addColorStop(0, dark ? 'rgba(180,150,100,0.07)' : 'rgba(255,255,245,0.12)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.lineWidth = 0.6;
  for (let i = 0; i < 1400; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const a = rnd() * Math.PI * 2;
    const l = 4 + rnd() * 12;
    g.strokeStyle = rnd() > 0.5 ? 'rgba(120,95,60,0.10)' : 'rgba(255,255,255,0.25)';
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = rnd() > 0.35 ? `rgba(70,55,40,${0.05 + rnd() * 0.12})` : `rgba(255,255,250,${0.2 + rnd() * 0.3})`;
    g.fillRect(rnd() * W, rnd() * H, rnd() * 1.6 + 0.3, rnd() * 1.6 + 0.3);
  }
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(110,80,40,0.16)');
  g.fillStyle = vg;
  g.fillRect(0, 0, W, H);
  paperCanvas = c;

  // grain overlay (drawn over the ink so ink looks printed *into* paper)
  const gc = document.createElement('canvas');
  gc.width = W * S;
  gc.height = H * S;
  const gg = gc.getContext('2d')!;
  gg.scale(S, S);
  for (let i = 0; i < 16000; i++) {
    const light = rnd() > 0.45;
    gg.fillStyle = light ? `rgba(250,244,230,${0.12 + rnd() * 0.28})` : `rgba(40,30,20,${0.03 + rnd() * 0.06})`;
    const s = rnd() * 1.4 + 0.4;
    gg.fillRect(rnd() * W, rnd() * H, s, s);
  }
  grainCanvas = gc;
}

export function drawPaper(ctx: Ctx) {
  if (paperCanvas) ctx.drawImage(paperCanvas, 0, 0, W, H);
  else {
    ctx.fillStyle = INK.paper;
    ctx.fillRect(0, 0, W, H);
  }
}

export function drawGrain(ctx: Ctx) {
  if (grainCanvas) ctx.drawImage(grainCanvas, 0, 0, W, H);
}
