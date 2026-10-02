// Step 8 · The value case — framework only, no dollar figures.
import { INK, FONT, type Ctx, rrPath, ink, outline, paperFill, text, chip, stamp, sun } from '../ink';
import { ease, seg, lerp, clamp, hash } from '../motion';
import { LEVERS } from '../story';
import { tb, type Scene } from './types';
import { briefCard, handover } from './kit';

const BAR = { x: 230, y: 520, w: 1460, h: 132 };

const MEASURE = [
  { label: 'Baseline', text: 'Today’s time and output, measured by ExampleCo' },
  { label: 'Pilot', text: 'The same real tasks, done with Glean' },
  { label: 'Owner review', text: 'Scored by the business owner' },
  { label: 'Business case', text: 'ExampleCo’s own volumes and rates' },
];

export const valueScene: Scene = {
  durations: [4.4, 4.6],
  focus: () => ({ x: 960, y: 600 }),
  render(ctx: Ctx, st) {
    const t0 = tb(st, 0);
    const t1 = tb(st, 1);
    const T = st.time;
    const keep = handover(t1, 0.5);

    // ── beat 1 · a week of work: capacity moves back to customers ──
    if (keep > 0) {
      ctx.save();
      ctx.globalAlpha *= keep;
      const ap = ease.out(seg(t0, 0.1, 0.7));
      const lost = lerp(0.44, 0.17, ease.inOut(seg(t0, 1.3, 1.4)));
      const bw = BAR.w * ap;
      const split = BAR.x + bw * (1 - lost);
      rrPath(ctx, BAR.x + 9, BAR.y + 10, bw, BAR.h, 24);
      ink(ctx, { tone: { color: INK.navy, level: 0.45, cell: 6 } });
      ctx.save();
      rrPath(ctx, BAR.x, BAR.y, bw, BAR.h, 24);
      ctx.clip();
      ctx.fillStyle = INK.blue;
      ctx.fillRect(BAR.x, BAR.y, split - BAR.x, BAR.h);
      ctx.fillStyle = INK.card;
      ctx.fillRect(split, BAR.y, BAR.x + bw - split, BAR.h);
      rrPath(ctx, split, BAR.y, BAR.x + bw - split + 30, BAR.h, 0);
      ink(ctx, { color: INK.coral, flat: 0.25, tone: { color: INK.coral, level: 0.5, cell: 7 } });
      ctx.restore();
      rrPath(ctx, BAR.x, BAR.y, bw, BAR.h, 24);
      outline(ctx, { width: 3, offColor: INK.coral, seed: 4 });
      if (ap >= 1) {
        ctx.beginPath();
        ctx.moveTo(split, BAR.y - 14);
        ctx.lineTo(split, BAR.y + BAR.h + 14);
        outline(ctx, { width: 4, color: INK.navy });
        text(ctx, 'TIME WITH CUSTOMERS', BAR.x + 36, BAR.y + BAR.h / 2 + 8, { size: 22, family: FONT.mono, spacing: 2.5, color: INK.card, weight: 500 });
        text(ctx, 'SEARCHING · REBUILDING · CHASING', BAR.x + BAR.w - 30, BAR.y + BAR.h / 2 + 8, {
          size: 18, family: FONT.mono, spacing: 1.5, align: 'right', alpha: clamp(lost * 6 - 1.2), weight: 500,
        });
      }
      text(ctx, 'A SELLER’S WEEK', BAR.x, BAR.y - 26, { size: 16, family: FONT.mono, spacing: 2.5, alpha: 0.7 * ap });
      // arrow showing hours moving back
      const mp = ease.backOut(seg(t0, 2.2, 0.5));
      chip(ctx, '← HOURS BACK TO CUSTOMERS', split - 20, BAR.y + BAR.h + 64, { size: 17, align: 'right', bg: INK.lime, scale: mp });
      // the work that goes away
      ['searching five systems', 'rebuilding handoffs', 'chasing answers'].forEach((s, i) => {
        const cp = ease.backOut(seg(t0, 2.6 + i * 0.18, 0.4));
        const x = 520 + i * 440;
        const y = 860;
        const w = chip(ctx, s, x, y, { size: 19, align: 'center', bg: INK.card, scale: cp, mono: false, weight: 700 });
        const sp = ease.out(seg(t0, 3.1 + i * 0.18, 0.3));
        if (sp > 0) {
          ctx.beginPath();
          ctx.moveTo(x - w / 2 - 6, y + 2);
          ctx.lineTo(x - w / 2 - 6 + (w + 12) * sp, y - 2);
          outline(ctx, { width: 4, color: INK.coral });
        }
      });
      stamp(ctx, 'CAPACITY, NOT A BUDGET CUT', 960, 990, { size: 38, rot: -0.03, p: seg(t0, 3.7, 0.55), color: INK.blue, scrim: true });
      ctx.restore();
    }

    // ── beat 2 · a few workflows carry the case; measured on ExampleCo's numbers ──
    if (t1 > 0) {
      sun(ctx, 520, 640, 380 * ease.out(seg(t1, 0.2, 1.0)), INK.lime, { level: 0.06, cell: 13, alpha: 0.45 });
      const slots: [number, number][] = [[520, 470], [520, 590], [330, 735], [700, 760], [390, 870], [690, 885], [520, 990]];
      LEVERS.forEach((l, i) => {
        const [x, y] = slots[i];
        const p = ease.backOut(seg(t1, 0.4 + i * 0.12, 0.45));
        const glow = l.lead ? ease.out(seg(t1, 1.6, 0.5)) : 0;
        ctx.save();
        ctx.translate(x, y + Math.sin(T * 1.3 + i) * 2);
        ctx.rotate((hash(i * 2.7) - 0.5) * 0.06);
        chip(ctx, l.label, 0, 0, {
          size: l.lead ? lerp(20, 24, glow) : 17, align: 'center', bg: l.lead ? (glow > 0.5 ? INK.lime : INK.card) : INK.paper, scale: p,
          mono: false, weight: 700, alpha: l.lead ? 1 : lerp(1, 0.55, ease.out(seg(t1, 1.6, 0.5))),
        });
        ctx.restore();
        if (l.lead && glow > 0) chip(ctx, 'PROVE FIRST', x + 210, y - 30, { size: 12, align: 'center', bg: INK.coral, fg: INK.card, border: INK.navy, scale: ease.backOut(glow) });
      });
      briefCard(ctx, 1380, 640, 760, 'Measured on ExampleCo’s numbers', MEASURE, ease.out(seg(t1, 1.9, 0.6)), t1 - 2.3, { rowH: 80, stagger: 0.32 });
      stamp(ctx, 'MEASURED, NOT ASSUMED', 1420, 975, { size: 40, rot: -0.04, p: seg(t1, 3.8, 0.55), color: INK.blue, scrim: true });
      void paperFill;
    }
  },
};
