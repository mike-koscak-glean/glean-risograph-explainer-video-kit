// Shared building blocks for the ExampleCo scenes.
import {
  INK, FONT, type Ctx, blobPath, circlePath, rrPath, ink, outline, paperFill, text, person, wrap, typedLines, drawLogo, fit, glyph, badge, chip,
} from '../ink';
import { ease, seg, lerp, type Pt, type Curve, bow } from '../motion';
import type { Cast } from '../story';
import type { LogoKey } from '../logos';
import { curvePath, arrowHead } from '../ink';

/** Persona with name + role, popping in at `at`. */
export function persona(ctx: Ctx, c: Cast, x: number, y: number, at: number, T: number, s = 72, alpha = 1) {
  const pp = ease.backOut(seg(at, 0, 0.55));
  if (pp <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  person(ctx, x, y, s, c.style, { scale: pp, time: T });
  text(ctx, c.name, x, y + s * 0.56, { size: s * 0.33, weight: 800, family: FONT.display, align: 'center', alpha: pp });
  text(ctx, c.role.toUpperCase(), x, y + s * 0.56 + s * 0.36, { size: Math.max(12, s * 0.18), family: FONT.mono, align: 'center', spacing: 1.5, alpha: 0.6 * pp });
  ctx.restore();
}

/** The recurring coral question disc. `ring` adds Glean's dashed blue ring. */
export function askBubble(ctx: Ctx, q: string, x: number, y: number, r0: number, at: number, T: number, o: { ring?: number; seed?: number } = {}) {
  const bp = ease.elasticOut(seg(at, 0.3, 1.0));
  if (bp <= 0.001) return;
  const r = r0 * bp;
  const sd = o.seed ?? 7;
  blobPath(ctx, x + 9, y + 10, r, sd, 0.035, T);
  ink(ctx, { tone: { color: INK.blue, level: 0.45, cell: 7 } });
  blobPath(ctx, x, y, r, sd, 0.035, T);
  paperFill(ctx, INK.card);
  blobPath(ctx, x, y, r, sd, 0.035, T);
  ink(ctx, { color: INK.coral, flat: 1, tone: { color: INK.coral, level: 0.35, cell: 7, alpha: 0.6 } });
  blobPath(ctx, x, y, r, sd, 0.035, T);
  outline(ctx, { width: 3.5, offColor: INK.blue, seed: 17 });
  if (o.ring && o.ring > 0) {
    ctx.save();
    ctx.globalAlpha *= o.ring;
    circlePath(ctx, x, y, r + 18);
    outline(ctx, { width: 3, color: INK.blue, dash: [10, 8], dashOffset: -T * 20 });
    ctx.restore();
  }
  const size = q.length > 34 ? 25 : 28;
  const lines = wrap(ctx, q, r0 * 1.55, size, 800, FONT.display);
  const n = q.length * seg(at, 0.6, 0.9);
  typedLines(ctx, lines, n, x, y - ((lines.length - 1) * (size + 5)) / 2 + 9, size + 5, { size, weight: 800, family: FONT.display, center: true });
}

/** A small "thought" trail from a persona to its bubble. */
export function thoughtDots(ctx: Ctx, from: Pt, at: number) {
  for (let i = 0; i < 2; i++) {
    const p = ease.backOut(seg(at, 0.25 + i * 0.08, 0.35));
    circlePath(ctx, from.x + i * 30, from.y - i * 28, (8 + i * 4) * p);
    ink(ctx, { color: INK.coral, flat: 1 });
  }
}

/** Clock with a spinning hand — "time going by". */
export function clock(ctx: Ctx, x: number, y: number, r: number, T: number, p: number, color: string = INK.coral) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(p, p);
  circlePath(ctx, 4, 5, r);
  ink(ctx, { tone: { color, level: 0.5, cell: 6 } });
  circlePath(ctx, 0, 0, r);
  paperFill(ctx, INK.card);
  circlePath(ctx, 0, 0, r);
  outline(ctx, { width: 3, offColor: color, seed: 3 });
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK.navy;
  ctx.lineWidth = 3.5;
  const a1 = T * 5.2;
  const a2 = T * 0.45;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.sin(a1) * r * 0.72, -Math.cos(a1) * r * 0.72);
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.sin(a2) * r * 0.45, -Math.cos(a2) * r * 0.45);
  ctx.stroke();
  circlePath(ctx, 0, 0, 3.5);
  ink(ctx, { color: INK.navy, flat: 1 });
  ctx.restore();
}

export type BriefRow = { app?: LogoKey; label: string; text: string; flag?: boolean };

/**
 * Glean answer card with cited rows.
 * p: card appear 0..1 · rowsT: seconds since rows started · stagger between rows.
 */
export function briefCard(
  ctx: Ctx,
  cx: number,
  cy: number,
  w: number,
  header: string,
  rows: BriefRow[],
  p: number,
  rowsT: number,
  o: { stagger?: number; agent?: boolean; rowH?: number; T?: number } = {},
) {
  if (p <= 0.001) return;
  const rowH = o.rowH ?? 82;
  const headH = 86;
  const h = headH + rows.length * rowH + 18;
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  const sc = lerp(0.86, 1, ease.backOut(p));
  ctx.save();
  ctx.globalAlpha *= Math.min(1, p * 1.6);
  ctx.translate(cx, cy);
  ctx.scale(sc, sc);
  ctx.translate(-cx, -cy);
  rrPath(ctx, x0 + 10, y0 + 12, w, h, 18);
  ink(ctx, { tone: { color: INK.blue, level: 0.5, cell: 6 } });
  rrPath(ctx, x0, y0, w, h, 18);
  paperFill(ctx, INK.card);
  rrPath(ctx, x0, y0, w, h, 18);
  outline(ctx, { width: 3, offColor: INK.coral, seed: cx });
  // header band
  ctx.save();
  rrPath(ctx, x0, y0, w, headH, 18);
  ctx.clip();
  ctx.fillStyle = INK.blue;
  ctx.fillRect(x0, y0, w, headH);
  ctx.restore();
  circlePath(ctx, x0 + 44, y0 + headH / 2, 24);
  paperFill(ctx, INK.card);
  drawLogo(ctx, 'glean', x0 + 44, y0 + headH / 2, 30);
  text(ctx, header, x0 + 76, y0 + headH / 2 + 9, { size: 26, weight: 800, family: FONT.display, color: INK.card });
  if (o.agent) chip(ctx, 'AGENT', x0 + w - 24, y0 + headH / 2, { size: 13, align: 'right', bg: INK.lime, border: INK.navy, weight: 500 });
  else chip(ctx, 'CITED', x0 + w - 24, y0 + headH / 2, { size: 13, align: 'right', bg: INK.card, border: INK.card, weight: 500 });
  // rows
  const stg = o.stagger ?? 0.42;
  rows.forEach((r, i) => {
    const rp = ease.out(seg(rowsT, i * stg, 0.45));
    if (rp <= 0.001) return;
    const ry = y0 + headH + 9 + i * rowH;
    const midY = ry + rowH / 2;
    ctx.save();
    ctx.globalAlpha *= rp;
    ctx.translate((1 - rp) * 24, 0);
    if (i > 0) {
      ctx.beginPath();
      ctx.moveTo(x0 + 24, ry);
      ctx.lineTo(x0 + w - 24, ry);
      outline(ctx, { width: 1.5, color: INK.navy, alpha: 0.15 });
    }
    // source logo disc
    circlePath(ctx, x0 + 50, midY, 24);
    paperFill(ctx, INK.paper);
    circlePath(ctx, x0 + 50, midY, 24);
    outline(ctx, { width: 2, color: INK.navy, alpha: 0.5 });
    if (r.app) drawLogo(ctx, r.app, x0 + 50, midY, 28);
    else glyph(ctx, 'people', x0 + 50, midY, 24, INK.navy, 2.2);
    text(ctx, r.label.toUpperCase(), x0 + 92, midY - 12, { size: 13, family: FONT.mono, spacing: 1.5, alpha: 0.65 });
    text(ctx, fit(ctx, r.text, w - 92 - 90, 22, 700), x0 + 92, midY + 18, { size: 22, weight: 700 });
    // citation / flag marker
    if (r.flag) badge(ctx, x0 + w - 44, midY, 17, { bg: INK.coral, label: '!', scale: ease.backOut(seg(rowsT, i * stg + 0.2, 0.4)) });
    else badge(ctx, x0 + w - 44, midY, 17, { bg: INK.lime, label: String(i + 1), scale: ease.backOut(seg(rowsT, i * stg + 0.2, 0.4)) });
    ctx.restore();
  });
  ctx.restore();
}

/** Dashed connector with an arrowhead, drawn up to `p`. */
export function connector(ctx: Ctx, a: Pt, b: Pt, p: number, T: number, color: string = INK.blue, bend = 0.12, width = 2.5) {
  if (p <= 0.001) return;
  const c: Curve = bow(a, b, bend);
  curvePath(ctx, c, 0, p);
  outline(ctx, { width, color, dash: [2, 9], dashOffset: -T * 30 });
  if (p >= 1) arrowHead(ctx, b, Math.atan2(b.y - c[2].y, b.x - c[2].x), 11, color);
}

/** 0..1 fade used when a scene's later beat replaces an earlier layout. */
export const handover = (tNext: number, dur = 0.5) => 1 - ease.inOut(seg(tNext, 0, dur));
