// Step 9 · The pilot — who, what, and how it's scored.
import { INK, FONT, type Ctx, rrPath, ink, outline, paperFill, text, chip, stamp, sticker, card, person, measure, sun, drawLogo } from '../ink';
import { ease, seg, lerp, clamp } from '../motion';
import { PILOT_APPS, PILOT_GROUPS, PHASES, SCORECARD } from '../story';
import { tb, type Scene } from './types';
import { connector, handover } from './kit';

const SHIRT_HAIR: ('bun' | 'long' | 'short' | 'curly')[] = ['short', 'long', 'bun', 'curly'];

function block(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string, seed: number, p: number) {
  if (p <= 0.001) return;
  const ww = w * p;
  rrPath(ctx, x + 7, y + 8, ww, h, 16);
  ink(ctx, { tone: { color: INK.navy, level: 0.42, cell: 6 } });
  rrPath(ctx, x, y, ww, h, 16);
  paperFill(ctx, fill);
  rrPath(ctx, x, y, ww, h, 16);
  outline(ctx, { width: 2.5, offColor: INK.coral, seed });
}

export const pilotScene: Scene = {
  durations: [3.8, 4.4, 4.2],
  focus: () => ({ x: 960, y: 620 }),
  render(ctx, st) {
    const t0 = tb(st, 0);
    const t1 = tb(st, 1);
    const t2 = tb(st, 2);
    const T = st.time;
    const keep0 = handover(t1, 0.5);
    const keep1 = handover(t2, 0.5);

    // ── beat 1 · people + systems ──
    if (keep0 > 0) {
      ctx.save();
      ctx.globalAlpha *= keep0;
      let k = 0;
      PILOT_GROUPS.forEach((g, r) => {
        const y = 420 + r * 140;
        const lp = ease.out(seg(t0, 0.2 + r * 0.25, 0.4));
        text(ctx, g.label.toUpperCase(), 170, y - 6, { size: 14, family: FONT.mono, spacing: 1.5, alpha: 0.7 * lp, weight: 500 });
        for (let i = 0; i < g.n; i++) {
          const pp = ease.backOut(seg(t0, 0.3 + r * 0.25 + i * 0.05, 0.4));
          person(ctx, 200 + i * 66, y + 100, 30, { shirt: g.color, hair: SHIRT_HAIR[(i + r) % 4], seed: k++ }, { scale: pp, time: T });
        }
      });
      chip(ctx, 'INCLUDING 3–5 POWER USERS WHO BUILD AGENTS', 500, 1010, { size: 14, align: 'center', bg: INK.lime, scale: ease.backOut(seg(t0, 1.6, 0.4)) });
      // systems
      sun(ctx, 1450, 640, 330 * ease.out(seg(t0, 0.6, 1.0)), INK.blue, { level: 0.04, cell: 13, alpha: 0.3 });
      chip(ctx, '7 PILOT CONNECTORS', 1450, 400, { size: 16, align: 'center', bg: INK.blue, fg: INK.card, border: INK.navy, scale: ease.backOut(seg(t0, 0.9, 0.4)) });
      PILOT_APPS.forEach((key, i) => {
        const row = i < 4 ? 0 : 1;
        const n = row === 0 ? 4 : 3;
        const j = row === 0 ? i : i - 4;
        const x = 1450 + (j - (n - 1) / 2) * 150;
        const y = 560 + row * 170;
        sticker(ctx, key, x, y, 48, { scale: ease.backOut(seg(t0, 1.0 + i * 0.1, 0.45)), seed: i + 40 });
      });
      chip(ctx, 'FINAL LIST CONFIRMED WITH EACH APP OWNER', 1450, 880, { size: 13, align: 'center', bg: INK.card, scale: ease.backOut(seg(t0, 1.9, 0.4)) });
      ctx.restore();
    }

    // ── beat 2 · timeline + how each task is scored ──
    if (t1 > 0 && keep1 > 0) {
      ctx.save();
      ctx.globalAlpha *= keep1;
      const X0 = 180;
      const Y = 450;
      const segs = [
        { x: X0, w: 420, fill: INK.card },
        { x: X0, w: 420, fill: INK.paper2 },
        { x: X0 + 450, w: 520, fill: INK.lime },
        { x: X0 + 1000, w: 400, fill: INK.card },
      ];
      PHASES.forEach((ph, i) => {
        const s = segs[i];
        const y = i === 1 ? Y + 104 : Y;
        const h = i === 1 ? 64 : 88;
        const p = ease.out(seg(t1, 0.2 + i * 0.3, 0.5));
        block(ctx, s.x, y, s.w, h, s.fill, i * 7, p);
        if (p > 0.6) {
          const a = clamp((p - 0.6) / 0.4);
          text(ctx, ph.label, s.x + 22, y + h / 2 + (i === 1 ? 7 : -2), { size: i === 1 ? 19 : 23, weight: 800, family: FONT.display, alpha: a });
          if (i !== 1) text(ctx, ph.dur, s.x + 22, y + h / 2 + 24, { size: 13, family: FONT.mono, spacing: 1.5, alpha: 0.7 * a });
          else text(ctx, ph.dur, s.x + s.w - 20, y + h / 2 + 6, { size: 13, family: FONT.mono, spacing: 1.5, align: 'right', alpha: 0.7 * a });
        }
      });
      // real task: baseline → with Glean → owner review
      const cards = [
        { logo: undefined, title: 'Baseline today', meta: 'time + sample output' },
        { logo: 'glean' as const, title: 'Same task, with Glean', meta: 'search · assistant · agents' },
        { logo: undefined, title: 'Owner review', meta: 'accuracy · citations · usability' },
      ];
      cards.forEach((c, i) => {
        const x = 400 + i * 560;
        const p = ease.backOut(seg(t1, 1.8 + i * 0.35, 0.5));
        card(ctx, x, 810, { w: 440, h: 104, logo: c.logo, title: c.title, meta: c.meta, scale: p, titleSize: 24, seed: i * 13, shadow: i === 1 ? INK.blue : INK.navy });
        if (i < 2) connector(ctx, { x: x + 236, y: 810 }, { x: x + 322, y: 810 }, ease.out(seg(t1, 2.1 + i * 0.35, 0.3)), T, INK.blue, 0);
      });
      chip(ctx, 'FOR EACH SCENARIO: 3–5 REAL EXAMPLES', 960, 950, { size: 15, align: 'center', bg: INK.card, scale: ease.backOut(seg(t1, 3.0, 0.4)) });
      ctx.restore();
    }

    // ── beat 3 · scorecard: time down, quality up, per workflow ──
    if (t2 > 0) {
      const X0 = 150, PW = 1620, RH = 96;
      const TX = 690, BX = 820, BW = 360, QX = 1290;
      const hp = ease.out(seg(t2, 0.1, 0.4));
      const head = (label: string, x: number, dir: 0 | 1 | -1) => {
        text(ctx, label, x, 318, { size: 15, family: FONT.mono, spacing: 2, weight: 600, alpha: 0.75 * hp });
        if (!dir) return;
        const ax = x + measure(ctx, label, 15, 600, FONT.mono) + 15 * 0.13 * label.length + 14;
        ctx.save();
        ctx.globalAlpha *= hp;
        ctx.strokeStyle = INK.blue;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        const ay = 311; // dir 1 = down, -1 = up
        ctx.beginPath(); ctx.moveTo(ax, ay - 11 * dir); ctx.lineTo(ax, ay + 4 * dir); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax - 7, ay + 2 * dir); ctx.lineTo(ax + 7, ay + 2 * dir); ctx.lineTo(ax, ay + 11 * dir); ctx.closePath(); ctx.fill();
        ctx.restore();
      };
      head('WORKFLOW', X0 + 40, 0);
      head('TIME SPENT', TX, 1);
      head('QUALITY OF OUTPUT', QX, -1);

      SCORECARD.forEach((r, i) => {
        const cy = 400 + i * (RH + 16);
        const rp = ease.out(seg(t2, 0.2 + i * 0.22, 0.45));
        if (rp <= 0.001) return;
        ctx.save();
        ctx.globalAlpha *= rp;
        ctx.translate(0, (1 - rp) * 24);
        const y0 = cy - RH / 2;
        rrPath(ctx, X0 + 7, y0 + 8, PW, RH, 18);
        ink(ctx, { tone: { color: INK.navy, level: 0.4, cell: 6 } });
        rrPath(ctx, X0, y0, PW, RH, 18);
        paperFill(ctx, INK.card);
        rrPath(ctx, X0, y0, PW, RH, 18);
        outline(ctx, { width: 2.5, offColor: INK.coral, seed: 40 + i * 3 });

        drawLogo(ctx, r.logo, X0 + 62, cy, 40);
        text(ctx, r.name, X0 + 104, cy + 8, { size: 26, weight: 700 });

        // time: today (full) vs with Glean (shorter)
        const ta = ease.out(seg(t2, 0.35 + i * 0.22, 0.5));
        const tg = ease.inOut(seg(t2, 1.2 + i * 0.3, 0.7));
        text(ctx, 'TODAY', TX, cy - 9, { size: 12, family: FONT.mono, spacing: 1.5, alpha: 0.7 });
        text(ctx, 'WITH GLEAN', TX, cy + 27, { size: 12, family: FONT.mono, spacing: 1.5, alpha: 0.7 * Math.min(1, tg * 3) });
        if (ta > 0.001) {
          rrPath(ctx, BX, cy - 26, BW * ta, 20, 10);
          ink(ctx, { color: INK.coral, flat: 0.9 });
        }
        if (tg > 0.001) {
          rrPath(ctx, BX, cy + 10, BW * r.time * tg, 20, 10);
          paperFill(ctx, INK.blue);
        }

        // quality: pips fill from today's level up to the with-Glean level
        const qa = seg(t2, 0.4 + i * 0.22, 0.4);
        const qg = seg(t2, 1.4 + i * 0.3, 0.6);
        for (let k = 0; k < 5; k++) {
          const px = QX + k * 50;
          const py = cy - 24;
          rrPath(ctx, px, py, 42, 18, 9);
          const today = k < r.q0 && qa > k / r.q0;
          const up = k >= r.q0 && k < r.q1 && qg > (k - r.q0) / Math.max(1, r.q1 - r.q0);
          if (today) ink(ctx, { tone: { color: INK.navy, level: 0.55, cell: 5 } });
          else if (up) { paperFill(ctx, INK.lime); rrPath(ctx, px, py, 42, 18, 9); }
          ctx.save();
          ctx.globalAlpha *= today || up ? 1 : 0.35;
          ctx.strokeStyle = INK.navy;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
        text(ctx, r.qual, QX, cy + 28, { size: 19, weight: 500, alpha: 0.85 * ease.out(seg(t2, 1.7 + i * 0.3, 0.4)) });
        ctx.restore();
      });

      chip(ctx, 'PERMISSIONS RESPECTED ON EVERY TEST CASE', 960, 852, { size: 16, align: 'center', bg: INK.lime, border: INK.navy, scale: ease.backOut(seg(t2, 2.7, 0.4)) });
      stamp(ctx, 'LESS TIME, BETTER WORK', 960, 960, { size: 46, rot: -0.035, p: seg(t2, 3.4, 0.55), color: INK.blue, scrim: true });
      text(ctx, 'ILLUSTRATIVE · MEASURES AGREED WITH EACH OWNER BEFORE TESTING STARTS', 960, 1046, { size: 13, family: FONT.mono, spacing: 2, align: 'center', alpha: 0.6 * ease.out(seg(t2, 3.0, 0.5)) });
      void lerp;
    }
  },
};
