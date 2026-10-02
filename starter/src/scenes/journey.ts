// Step 1 · "ExampleCo today" — the customer journey, siloed.
// Step 10 · the close — the same journey on one foundation, then the end card.
import { INK, FONT, W, type Ctx, rrPath, ink, outline, paperFill, text, chip, sticker, stamp, circlePath, blobPath, badge, drawLogo, measure } from '../ink';
import { ease, seg, lerp, clamp, hash, type Pt } from '../motion';
import { STATIONS, HANDOFF_LOSSES, ACCOUNT, TAGLINE } from '../story';
import { tb, type Scene } from './types';
import { persona, handover } from './kit';

const XS = [290, 625, 960, 1295, 1630];
const SILO = { w: 292, top: 300, bot: 935 };
const ROAD_Y = 372;
const PERSON_Y = 612;
const APP_Y = 835;
const GAPS = [457, 792, 1127, 1462];

type JState = {
  appear: number; // seconds since stations started appearing
  silos: number; // 0..1
  appsT: number; // seconds since app stickers started
  broken: number; // 0..1 · handoff gaps open
  lossT: number; // seconds since loss chips started falling
  fixed: number; // 0..1 · Glean repairs the road
  token: number; // 0..1 · customer position along the road
  checks: number; // seconds since check badges started
};

function roadPt(u: number): Pt {
  const x = lerp(120, 1800, u);
  return { x, y: ROAD_Y + Math.sin(u * Math.PI * 4) * 14 };
}

function drawRoad(ctx: Ctx, s: JState, T: number) {
  const draw = ease.inOut(clamp(s.appear / 1.4));
  if (draw <= 0) return;
  const gapW = 46 * ease.out(s.broken) * (1 - s.fixed);
  const N = 160;
  const pts: Pt[] = [];
  for (let i = 0; i <= N * draw; i++) pts.push(roadPt(i / N));
  const color = s.fixed > 0.5 ? INK.blue : INK.fxNavy;
  // split at handoff gaps
  const runs: Pt[][] = [[]];
  for (const p of pts) {
    const inGap = gapW > 1 && GAPS.some((g) => Math.abs(p.x - g) < gapW / 2);
    if (inGap) {
      if (runs[runs.length - 1].length) runs.push([]);
    } else runs[runs.length - 1].push(p);
  }
  for (const run of runs) {
    if (run.length < 2) continue;
    ctx.beginPath();
    ctx.moveTo(run[0].x, run[0].y);
    for (const p of run) ctx.lineTo(p.x, p.y);
    ctx.lineCap = 'round';
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 22;
    ctx.strokeStyle = s.fixed > 0.5 ? INK.blue : INK.fx;
    ctx.stroke();
    ctx.restore();
    outline(ctx, { width: 3, color, dash: s.fixed > 0.5 ? undefined : [14, 10], dashOffset: -T * 24 });
  }
  // jagged ends at the gaps
  if (gapW > 4) {
    GAPS.forEach((g) => {
      for (const side of [-1, 1]) {
        const x = g + (side * gapW) / 2;
        ctx.beginPath();
        ctx.moveTo(x, ROAD_Y - 18);
        ctx.lineTo(x + side * 6, ROAD_Y - 6);
        ctx.lineTo(x - side * 3, ROAD_Y + 4);
        ctx.lineTo(x + side * 5, ROAD_Y + 16);
        outline(ctx, { width: 2.5, color: INK.coral });
      }
    });
  }
}

function drawToken(ctx: Ctx, s: JState, T: number) {
  const a = clamp(s.appear - 0.8);
  if (a <= 0) return;
  const p = roadPt(s.token);
  const bob = Math.sin(T * 3) * 3;
  blobPath(ctx, p.x + 5, p.y - 30 + bob + 6, 26, 4, 0.05, T);
  ink(ctx, { tone: { color: INK.navy, level: 0.45, cell: 6 } });
  blobPath(ctx, p.x, p.y - 30 + bob, 26, 4, 0.05, T);
  ink(ctx, { color: INK.coral, flat: 1 });
  blobPath(ctx, p.x, p.y - 30 + bob, 26, 4, 0.05, T);
  outline(ctx, { width: 2.5, offColor: INK.blue, seed: 4 });
  text(ctx, ACCOUNT.toUpperCase(), p.x, p.y - 72 + bob, { size: 13, family: FONT.mono, spacing: 2, align: 'center', weight: 500, alpha: a });
  text(ctx, 'customer', p.x, p.y - 25 + bob, { size: 12, family: FONT.mono, align: 'center', color: INK.card, alpha: a });
}

function drawJourney(ctx: Ctx, s: JState, T: number) {
  // silos rise from the floor
  if (s.silos > 0) {
    XS.forEach((x, i) => {
      const p = ease.out(clamp(s.silos * 1.4 - i * 0.1));
      if (p <= 0) return;
      const h = (SILO.bot - SILO.top) * p;
      const y0 = SILO.bot - h;
      rrPath(ctx, x - SILO.w / 2 + 8, y0 + 9, SILO.w, h, 22);
      ink(ctx, { tone: { color: INK.fxNavy, level: 0.35, cell: 7, alpha: 0.55 * (1 - s.fixed * 0.6) } });
      rrPath(ctx, x - SILO.w / 2, y0, SILO.w, h, 22);
      paperFill(ctx, INK.paper2, 0.92);
      rrPath(ctx, x - SILO.w / 2, y0, SILO.w, h, 22);
      outline(ctx, { width: 2.5, color: INK.navy, alpha: 0.55 });
    });
  }
  drawRoad(ctx, s, T);
  STATIONS.forEach((st, i) => {
    const at = s.appear - 0.3 - i * 0.18;
    persona(ctx, st.who, XS[i], PERSON_Y, at, T, 64);
    const cp = ease.backOut(seg(at, 0.25, 0.4));
    chip(ctx, st.team, XS[i], 724, { size: 14, align: 'center', bg: INK.fx, fg: INK.card, border: INK.fxNavy, scale: cp, weight: 500 });
    st.apps.forEach((key, j) => {
      const ap = ease.backOut(seg(s.appsT, 0.25 + i * 0.2 + j * 0.08, 0.45));
      sticker(ctx, key, XS[i] + (j - (st.apps.length - 1) / 2) * 96, APP_Y, 34, { scale: ap, seed: i * 10 + j, shadow: INK.fxNavy });
    });
    // repaired: a check on every station
    const bp = ease.backOut(seg(s.checks, i * 0.15, 0.45));
    if (bp > 0) badge(ctx, XS[i] + 46, PERSON_Y - 128, 18, { bg: INK.lime, glyph: 'check', scale: bp });
  });
  // what falls through the gaps
  if (s.lossT > 0) {
    HANDOFF_LOSSES.forEach((label, i) => {
      const lt = s.lossT - i * 0.28;
      if (lt <= 0) return;
      const fall = ease.inQuad(clamp(lt / 3.2));
      const a = clamp(lt * 3) * (1 - clamp((lt - 2.6) / 0.8)) * (1 - s.fixed);
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.translate(GAPS[i], ROAD_Y + 40 + fall * 300);
      ctx.rotate((hash(i * 3.3) - 0.5) * 0.5 + fall * (i % 2 ? 0.4 : -0.4));
      chip(ctx, label, 0, 0, { size: 15, align: 'center', bg: INK.card, border: INK.coral, mono: false, weight: 700 });
      ctx.restore();
    });
  }
  drawToken(ctx, s, T);
}

// ── Step 1 ───────────────────────────────────────────────────
export const journeyScene: Scene = {
  durations: [4.4, 3.2, 3.6],
  focus: () => ({ x: XS[0], y: PERSON_Y - 60 }),
  render(ctx, st) {
    const t0 = tb(st, 0);
    const t1 = tb(st, 1);
    const t2 = tb(st, 2);
    const T = st.time;
    const tok = ease.inOut(seg(t0, 1.0, 3.2));
    // in beat 3 the customer bounces back and forth between teams
    const back = t2 > 0 ? 0.5 + 0.5 * Math.cos(seg(t2, 0.3, 3.4) * Math.PI) : 1;
    drawJourney(ctx, {
      appear: t0, silos: seg(t1, 0, 0.8), appsT: t1, broken: seg(t2, 0, 0.6), lossT: t2 - 0.4, fixed: 0,
      token: t2 > 0 ? lerp(0.12, 1, back) : tok, checks: 0,
    }, T);
    if (t2 > 0) {
      // "like I told your colleague…"
      const bp = ease.backOut(seg(t2, 1.4, 0.45));
      const tp = roadPt(lerp(0.12, 1, back));
      if (bp > 0) {
        ctx.save();
        ctx.translate(tp.x, tp.y - 112);
        ctx.scale(bp, bp);
        chip(ctx, '“As I said last time…”', 0, 0, { size: 16, align: 'center', bg: INK.card, border: INK.navy, mono: false, weight: 700 });
        ctx.restore();
      }
      stamp(ctx, 'CONTEXT LOST AT EVERY HANDOFF', W / 2, 1002, { size: 38, rot: -0.03, p: seg(t2, 2.4, 0.55), scrim: true });
    }
  },
};

// ── Step 10 ──────────────────────────────────────────────────
export const closeScene: Scene = {
  durations: [4.6, 3.6],
  focus: () => ({ x: W / 2, y: 520 }),
  render(ctx, st) {
    const t0 = tb(st, 0);
    const t1 = tb(st, 1);
    const T = st.time;
    const keep = handover(t1, 0.7);
    const fixed = ease.inOut(seg(t0, 0.6, 1.0));
    if (keep > 0) {
      ctx.save();
      ctx.globalAlpha *= keep;
      // the foundation bar under every team
      const bp = ease.out(seg(t0, 0.1, 0.9));
      if (bp > 0) {
        const bw = 1680 * bp;
        rrPath(ctx, W / 2 - bw / 2 + 8, 960 + 9, bw, 74, 37);
        ink(ctx, { tone: { color: INK.navy, level: 0.45, cell: 6 } });
        rrPath(ctx, W / 2 - bw / 2, 960, bw, 74, 37);
        paperFill(ctx, INK.blue);
        rrPath(ctx, W / 2 - bw / 2, 960, bw, 74, 37);
        outline(ctx, { width: 2.5, offColor: INK.coral, seed: 9 });
        const la = clamp(bp * 2 - 1);
        circlePath(ctx, W / 2 - 236, 997, 22 * la);
        paperFill(ctx, INK.card);
        drawLogo(ctx, 'glean', W / 2 - 236, 997, 28, la);
        text(ctx, 'ONE FOUNDATION · EVERY TEAM', W / 2 + 20, 1005, { size: 20, family: FONT.mono, spacing: 3, color: INK.card, align: 'center', weight: 500, alpha: la });
        XS.forEach((x, i) => {
          const lp = ease.out(seg(t0, 0.7 + i * 0.1, 0.5));
          if (lp <= 0) return;
          ctx.beginPath();
          ctx.moveTo(x, 960);
          ctx.lineTo(x, lerp(960, 878, lp));
          outline(ctx, { width: 3, color: INK.blue, dash: [3, 7], dashOffset: -T * 20 });
        });
      }
      drawJourney(ctx, {
        appear: 9, silos: 1, appsT: 9, broken: 1, lossT: 0, fixed, token: (0.05 + T * 0.06) % 1, checks: t0 - 1.4,
      }, T);
      ctx.restore();
    }
    // ── end card ──
    if (t1 > 0) {
      const a = ease.out(seg(t1, 0.4, 0.8));
      const gW = 300;
      const fW = 360;
      const gap = 110;
      const total = gW + gap + fW;
      const x0 = W / 2 - total / 2;
      drawLogo(ctx, 'gleanText', x0 + gW / 2, 420, gW, a);
      text(ctx, '×', x0 + gW + gap / 2, 448, { size: 64, weight: 500, family: FONT.display, align: 'center', alpha: a * 0.7 });
      drawLogo(ctx, 'exampleco', x0 + gW + gap + fW / 2, 430, fW, a);
      const tp = ease.outQuint(seg(t1, 0.8, 0.8));
      let size = 84;
      while (measure(ctx, TAGLINE, size, 800, FONT.display) > W - 300) size -= 2;
      text(ctx, TAGLINE, W / 2, 640 + (1 - tp) * 30, { size, weight: 800, family: FONT.display, align: 'center', alpha: tp, offColor: INK.coral, offAmt: 2.4 });
      const cp = ease.backOut(seg(t1, 1.4, 0.5));
      chip(ctx, 'PROPOSED PILOT · SCORED BY EXAMPLECO', W / 2, 760, { size: 20, align: 'center', bg: INK.lime, border: INK.navy, scale: cp, weight: 500 });
      circlePath(ctx, W / 2, 900, 0);
    }
  },
};
