// Step 2 · How Glean works — ExampleCo's systems → one index → the graph
import {
  INK, FONT, type Ctx, blobPath, circlePath, rrPath, ink, outline, paperFill, curvePath, text, sticker, card, chip, person, sun, glyph, drawLogo,
} from '../ink';
import { ease, seg, lerp, hash, bow, onCurve, clamp, type Pt, type Curve } from '../motion';
import { RING_APPS } from '../story';
import type { LogoKey } from '../logos';
import { tb, type Scene } from './types';

const C = { x: 960, y: 640 };
const RX = 690;
const RY = 330;

function ringPos(i: number): Pt {
  const step = 360 / RING_APPS.length;
  const a = (-90 + step / 2 + i * step) * (Math.PI / 180);
  return { x: C.x + Math.cos(a) * RX, y: C.y + Math.sin(a) * RY };
}

// token kinds: content, people, permissions, activity
const TOK = [
  { label: 'content', color: INK.blue },
  { label: 'people', color: INK.coral },
  { label: 'permissions', color: INK.navy },
  { label: 'activity', color: INK.lime },
];
function token(ctx: Ctx, kind: number, x: number, y: number, s: number, rot: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  const c = TOK[kind].color;
  if (kind === 0) {
    rrPath(ctx, -s * 0.7, -s * 0.9, s * 1.4, s * 1.8, s * 0.25);
    paperFill(ctx, INK.card);
    rrPath(ctx, -s * 0.7, -s * 0.9, s * 1.4, s * 1.8, s * 0.25);
    outline(ctx, { width: 2, color: c });
  } else if (kind === 1) {
    circlePath(ctx, 0, 0, s * 0.8);
    ink(ctx, { color: c, flat: 1 });
  } else if (kind === 2) {
    glyph(ctx, 'lock', 0, 0, s * 1.4, c, 2);
  } else {
    glyph(ctx, 'spark', 0, 0, s * 1.8, INK.navy, 2.2);
    circlePath(ctx, 0, 0, s * 0.45);
    ink(ctx, { color: c, flat: 1 });
  }
  ctx.restore();
}

type GNode = { id: string; x: number; y: number; kind: 'account' | 'person' | 'doc' | 'topic'; label: string; sub?: string; logo?: LogoKey; shirt?: string; hair?: 'bun' | 'long' | 'short' | 'curly' };
const NODES: GNode[] = [
  { id: 'acme', x: 960, y: 640, kind: 'account', label: 'Northstar', sub: 'ACCOUNT' },
  { id: 'sarah', x: 745, y: 505, kind: 'person', label: 'Sam', sub: 'CSM', shirt: INK.lime, hair: 'short' },
  { id: 'rachel', x: 1190, y: 500, kind: 'person', label: 'Dana', sub: 'AE', shirt: INK.coral, hair: 'long' },
  { id: 'rollout', x: 955, y: 420, kind: 'doc', label: 'QBR call', logo: 'gong' },
  { id: 'eng', x: 700, y: 760, kind: 'doc', label: 'Health score', logo: 'gainsight' },
  { id: 'forecast', x: 1230, y: 740, kind: 'doc', label: 'Renewal opp', logo: 'salesforce' },
  { id: 'onb', x: 940, y: 860, kind: 'topic', label: 'cloud cost', sub: 'TOPIC' },
  { id: 'team', x: 1415, y: 610, kind: 'topic', label: 'EMEA Sales', sub: 'TEAM' },
];
const node = (id: string) => NODES.find((n) => n.id === id)!;
const EDGES: [string, string, string?][] = [
  ['sarah', 'acme', 'manages'],
  ['rachel', 'acme'],
  ['rollout', 'acme'],
  ['sarah', 'rollout', 'joined call'],
  ['rollout', 'onb', 'discussed'],
  ['onb', 'acme'],
  ['forecast', 'acme'],
  ['rachel', 'forecast', 'owns'],
  ['rachel', 'team', 'member of'],
  ['eng', 'acme'],
  ['eng', 'sarah'],
];

function edgeCurve(a: GNode, b: GNode, k: number): Curve {
  return bow(a, b, (hash(k * 3.1) - 0.5) * 0.3);
}

export const foundationScene: Scene = {
  durations: [4.2, 3.4, 3.2],
  focus: () => C,
  render(ctx, st) {
    const t0 = tb(st, 0);
    const t1 = tb(st, 1);
    const t2 = tb(st, 2);
    const T = st.time;
    const graphP = ease.inOut(seg(t1, 0, 1.0));

    // decorative background disc
    sun(ctx, C.x, C.y + 20, 400 * ease.out(seg(t0, 0, 1.4)), INK.blue, { level: 0.03, cell: 13, alpha: 0.28 });
    const ringE = ease.out(seg(t0, 0.2, 1.0));
    if (ringE > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(C.x, C.y, RX * ringE, RY * ringE, 0, 0, Math.PI * 2);
      outline(ctx, { width: 2, color: INK.navy, alpha: 0.25, dash: [3, 10], dashOffset: T * 8 });
      ctx.restore();
    }

    // streams: tokens flowing from apps into the core
    const streamI = clamp(seg(t0, 1.0, 0.6)) * (1 - 0.7 * graphP);
    if (streamI > 0) {
      RING_APPS.forEach((_, i) => {
        const a = ringPos(i);
        const dx = C.x - a.x;
        const dy = C.y - a.y;
        const cv: Curve = [a, { x: a.x + dx * 0.35 - dy * 0.25, y: a.y + dy * 0.35 + dx * 0.25 }, { x: a.x + dx * 0.75 - dy * 0.1, y: a.y + dy * 0.75 + dx * 0.1 }, C];
        for (let j = 0; j < 4; j++) {
          const u = (T * 0.32 + j / 4 + hash(i * 1.7)) % 1;
          const p = onCurve(cv, ease.inQuad(u));
          const kind = (i + j) % 4;
          const fadeIn = clamp(u * 6);
          const fadeOut = clamp((1 - u) * 5);
          token(ctx, kind, p.x, p.y, 9 * lerp(1, 0.5, u), u * 3 + i, streamI * fadeIn * fadeOut);
        }
      });
    }

    // app ring
    RING_APPS.forEach((key, i) => {
      const p = ringPos(i);
      const s = ease.backOut(seg(t0, 0.4 + i * 0.06, 0.5));
      sticker(ctx, key, p.x, p.y, 36 * lerp(1, 0.86, graphP), { scale: s, seed: i + 20, alpha: lerp(1, 0.75, graphP) });
      // Databricks already holds ExampleCo's structured data — Glean connects to it, not around it
      if (key === 'databricksIcon') {
        const cp = ease.backOut(seg(t0, 1.9, 0.45)) * (1 - graphP);
        chip(ctx, 'STRUCTURED DATA', p.x - 54, p.y + 2, { size: 13, align: 'right', bg: INK.fx, fg: INK.card, border: INK.fxNavy, scale: cp });
      }
    });

    // legend chip row (beat 0)
    const lg = ease.out(seg(t0, 1.6, 0.6));
    if (lg > 0) {
      const y = 1000;
      let x = 1330;
      TOK.forEach((k, i) => {
        token(ctx, i, x, y - 4, 9, 0, lg);
        text(ctx, k.label, x + 18, y + 2, { size: 15, family: FONT.mono, alpha: 0.75 * lg });
        x += 38 + k.label.length * 9.5;
      });
    }

    // the INDEX core
    const coreIn = ease.elasticOut(seg(t0, 0.5, 1.2));
    const coreR = 150 * coreIn * lerp(1, 0.0, graphP);
    if (coreR > 1) {
      for (let k = 0; k < 3; k++) {
        const u = (T * 0.5 + k / 3) % 1;
        circlePath(ctx, C.x, C.y, coreR + u * 110);
        outline(ctx, { width: 2, color: INK.blue, alpha: (1 - u) * 0.5 * coreIn * (1 - graphP) });
      }
      blobPath(ctx, C.x + 10, C.y + 12, coreR, 12, 0.04, T);
      ink(ctx, { tone: { color: INK.navy, level: 0.45, cell: 7 } });
      blobPath(ctx, C.x, C.y, coreR, 12, 0.04, T);
      paperFill(ctx, INK.card);
      blobPath(ctx, C.x, C.y, coreR, 12, 0.04, T);
      ink(ctx, { color: INK.blue, flat: 1 });
      blobPath(ctx, C.x, C.y, coreR, 12, 0.04, T);
      ink(ctx, { tone: { color: INK.lime, level: 0.1, cell: 9, alpha: 0.9 }, blend: 'source-over' });
      blobPath(ctx, C.x, C.y, coreR, 12, 0.04, T);
      outline(ctx, { width: 3.5, offColor: INK.coral, seed: 9 });
      const ta = coreIn * (1 - graphP * 2);
      text(ctx, 'INDEX', C.x, C.y + 16, { size: 56 * (coreR / 150), weight: 800, family: FONT.display, color: INK.card, align: 'center', alpha: clamp(ta) });
      text(ctx, 'ONE · PERMISSION-AWARE', C.x, C.y + 48, { size: 13, family: FONT.mono, color: INK.lime, align: 'center', spacing: 1.5, alpha: clamp(ta) });
    }

    // ── beat 1: graph unfolds ──
    if (graphP > 0) {
      const nodeP = (i: number) => ease.backOut(seg(t1, 0.3 + i * 0.1, 0.6));
      const pos = (n: GNode, i: number) => ({ x: lerp(C.x, n.x, ease.out(seg(t1, 0.3 + i * 0.1, 0.7))), y: lerp(C.y, n.y, ease.out(seg(t1, 0.3 + i * 0.1, 0.7))) });
      // edges
      EDGES.forEach(([a, b, label], k) => {
        const ia = NODES.indexOf(node(a));
        const ib = NODES.indexOf(node(b));
        const ep = ease.inOut(seg(t1, 1.0 + k * 0.08, 0.6));
        if (ep <= 0) return;
        const c = edgeCurve(pos(node(a), ia) as GNode, pos(node(b), ib) as GNode, k);
        curvePath(ctx, c, 0, ep);
        outline(ctx, { width: 2.5, color: INK.navy, alpha: 0.7, offColor: INK.blue, seed: k });
        if (label && ep >= 1) {
          const m = onCurve(c, 0.5);
          chip(ctx, label, m.x, m.y, { size: 12, align: 'center', bg: INK.paper, scale: ease.backOut(seg(t1, 1.6 + k * 0.05, 0.4)) });
        }
        // live pulses (beat 2)
        if (t2 > 0) {
          const u = (T * 0.45 + hash(k * 2.3)) % 1;
          const p = onCurve(c, u);
          circlePath(ctx, p.x, p.y, 7 * clamp(seg(t2, 0, 0.5)));
          ink(ctx, { color: INK.lime, flat: 1, blend: 'source-over' });
          circlePath(ctx, p.x, p.y, 7 * clamp(seg(t2, 0, 0.5)));
          outline(ctx, { width: 2 });
        }
      });
      // heat rings (beat 2)
      const heat = ease.out(seg(t2, 0.3, 0.6));
      if (heat > 0) {
        for (const id of ['rollout', 'forecast']) {
          const n = node(id);
          const u = (T * 0.8) % 1;
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(n.x, n.y, 110 + u * 30, 50 + u * 16, 0, 0, Math.PI * 2);
          outline(ctx, { width: 3, color: INK.coral, alpha: heat * (1 - u) });
          ctx.restore();
        }
      }
      // nodes
      NODES.forEach((n, i) => {
        const s = nodeP(i);
        if (s <= 0) return;
        const p = pos(n, i);
        drawNode(ctx, n, p.x, p.y, s, T);
      });
      // beat 2 chips + locks
      if (t2 > 0) {
        const chips: [string, string, number, number][] = [
          ['rollout', 'recorded yesterday', 0, -62],
          ['forecast', 'updated this week', 30, 58],
          ['sarah', 'active now', -120, 0],
        ];
        chips.forEach(([id, s, dx, dy], k) => {
          const n = node(id);
          chip(ctx, s, n.x + dx, n.y + dy, { size: 13, align: 'center', bg: INK.lime, scale: ease.backOut(seg(t2, 0.4 + k * 0.15, 0.5)) });
        });
        const lk = ease.backOut(seg(t2, 1.0, 0.5));
        for (const id of ['forecast', 'team']) {
          const n = node(id);
          const x = n.x + (n.kind === 'doc' ? 100 : 58);
          const y = n.y - (n.kind === 'doc' ? 34 : 50);
          if (lk > 0) {
            circlePath(ctx, x, y, 20 * lk);
            paperFill(ctx, INK.card);
            circlePath(ctx, x, y, 20 * lk);
            outline(ctx, { width: 2.5 });
            glyph(ctx, 'lock', x, y + 2, 18 * lk, INK.navy, 2.4);
          }
        }
        const pc = ease.out(seg(t2, 1.3, 0.6));
        if (pc > 0) {
          glyph(ctx, 'lock', 132, 1000, 20, INK.navy, 2.4);
          text(ctx, 'Permissions mirrored from every source app', 156, 1006, { size: 17, family: FONT.mono, alpha: 0.8 * pc });
        }
      }
    }
  },
};

function drawNode(ctx: Ctx, n: GNode, x: number, y: number, s: number, T: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (n.kind === 'account') {
    blobPath(ctx, 8, 10, 78, 40, 0.05, T);
    ink(ctx, { tone: { color: INK.navy, level: 0.45, cell: 7 } });
    blobPath(ctx, 0, 0, 78, 40, 0.05, T);
    paperFill(ctx, INK.card);
    blobPath(ctx, 0, 0, 78, 40, 0.05, T);
    ink(ctx, { color: INK.coral, flat: 1, tone: { color: INK.coral, level: 0.4, cell: 7, alpha: 0.6 } });
    blobPath(ctx, 0, 0, 78, 40, 0.05, T);
    outline(ctx, { width: 3.5, offColor: INK.blue, seed: 40 });
    text(ctx, n.label, 0, 4, { size: 25, weight: 800, family: FONT.display, align: 'center' });
    text(ctx, n.sub!, 0, 28, { size: 12, family: FONT.mono, align: 'center', spacing: 1.5, alpha: 0.7 });
  } else if (n.kind === 'person') {
    circlePath(ctx, 5, 6, 48);
    ink(ctx, { tone: { color: INK.blue, level: 0.5, cell: 6 } });
    circlePath(ctx, 0, 0, 48);
    paperFill(ctx, INK.card);
    ctx.save();
    circlePath(ctx, 0, 0, 48);
    ctx.clip();
    person(ctx, 0, 52, 34, { shirt: n.shirt!, hair: n.hair!, seed: x }, { time: T });
    ctx.restore();
    circlePath(ctx, 0, 0, 48);
    outline(ctx, { width: 3, offColor: INK.coral, seed: x });
    rrPath(ctx, -44, 58, 88, 42, 10);
    paperFill(ctx, INK.paper, 0.85);
    text(ctx, n.label, 0, 76, { size: 19, weight: 800, family: FONT.display, align: 'center' });
    text(ctx, n.sub!, 0, 94, { size: 11, family: FONT.mono, align: 'center', spacing: 1.5, alpha: 0.65 });
  } else if (n.kind === 'doc') {
    card(ctx, 0, 0, { w: 200, h: 60, logo: n.logo, title: n.label, noMeta: true, titleSize: 17, shadow: INK.blue, seed: x });
  } else {
    blobPath(ctx, 5, 6, 56, x, 0.07, T);
    ink(ctx, { tone: { color: INK.navy, level: 0.4, cell: 6 } });
    blobPath(ctx, 0, 0, 56, x, 0.07, T);
    paperFill(ctx, INK.card);
    blobPath(ctx, 0, 0, 56, x, 0.07, T);
    ink(ctx, { color: INK.lime, flat: 1 });
    blobPath(ctx, 0, 0, 56, x, 0.07, T);
    outline(ctx, { width: 3 });
    text(ctx, n.label, 0, 5, { size: 18, weight: 800, family: FONT.display, align: 'center' });
    text(ctx, n.sub!, 0, 24, { size: 11, family: FONT.mono, align: 'center', spacing: 1.5, alpha: 0.65 });
  }
  ctx.restore();
  void drawLogo;
}
