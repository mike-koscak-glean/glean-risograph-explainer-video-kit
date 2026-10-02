// Steps 3–6 · one renderer, four use cases.
// Beat 1 = "today" (manual crawl across systems) · Beat 2 = "with Glean" (one cited answer).
import { INK, FONT, type Ctx, card, stamp, chip, curvePath, outline, circlePath, ink, sun } from '../ink';
import { ease, seg, lerp, clamp, bow, onCurve, type Pt } from '../motion';
import type { UseCase } from '../story';
import { tb, type Scene } from './types';
import { persona, askBubble, thoughtDots, clock, briefCard, connector, handover } from './kit';
import type { SfxCue } from '../sfx';

const P = { x: 210, y: 880 };
const B = { x: 440, y: 520, r: 132 };
const BRIEF = { x: 1275, y: 640, w: 860 };

const DOC_POS: Record<number, [number, number, number][]> = {
  4: [[1080, 430, -0.04], [1450, 545, 0.03], [1110, 705, 0.02], [1465, 830, -0.03]],
  5: [[1060, 400, -0.04], [1450, 480, 0.03], [1090, 615, 0.02], [1470, 715, -0.03], [1140, 850, 0.03]],
};

/** Choreography anchors, shared with the sound cue sheet. */
export function ucTimes(uc: UseCase) {
  const n = uc.today.docs.length;
  const docs0 = 1.35;
  const crawl0 = docs0 + n * 0.22 + 0.35;
  const crawlDur = n * 0.5;
  const stamp0 = crawl0 + crawlDur + 0.35;
  const rows0 = 1.15;
  const stamp1 = rows0 + uc.glean.rows.length * 0.42 + 0.45;
  return { docs0, crawl0, crawlDur, stamp0, rows0, stamp1, d0: stamp0 + 0.9, d1: stamp1 + 0.9 };
}

export function ucSfx(uc: UseCase): [SfxCue[], SfxCue[]] {
  const k = ucTimes(uc);
  return [
    [
      { at: 0.1, kind: 'pop' },
      { at: 0.65, kind: 'ticks', gain: 0.6 },
      { at: k.docs0, kind: 'swish', gain: 0.8 },
      { at: k.crawl0, kind: 'ticks', gain: 0.5 },
      { at: k.stamp0, kind: 'stamp' },
    ],
    [
      { at: 0.15, kind: 'shimmer', gain: 0.7 },
      { at: 0.55, kind: 'pop', gain: 0.8 },
      { at: k.rows0, kind: 'ticks', gain: 0.6 },
      { at: k.stamp1, kind: 'stamp' },
      { at: k.stamp1 + 0.05, kind: 'chime', gain: 0.7 },
    ],
  ];
}

export function useCaseScene(uc: UseCase): Scene {
  const k = ucTimes(uc);
  const pos = DOC_POS[uc.today.docs.length] ?? DOC_POS[4];
  return {
    durations: [k.d0, k.d1],
    focus: () => ({ x: B.x, y: B.y }),
    render(ctx: Ctx, st) {
      const t0 = tb(st, 0);
      const t1 = tb(st, 1);
      const T = st.time;
      const toGlean = ease.inOut(seg(t1, 0, 0.8));
      const todayA = handover(t1, 0.35);

      // soft backdrop: coral while it hurts, blue once Glean answers
      sun(ctx, 1270, 650, 430 * ease.out(seg(t0, 0.9, 1.2)), INK.coral, { level: 0.04, cell: 13, alpha: 0.22 * (1 - toGlean) });
      if (t1 > 0) sun(ctx, BRIEF.x, BRIEF.y, 470 * ease.out(seg(t1, 0.1, 1.2)), INK.blue, { level: 0.04, cell: 13, alpha: 0.26 });

      // persona + question
      thoughtDots(ctx, { x: 268, y: 690 }, t0);
      persona(ctx, uc.persona, P.x, P.y, t0, T);
      askBubble(ctx, uc.question, B.x, B.y, B.r, t0, T, { ring: ease.out(seg(t1, 0.2, 0.5)) });

      // ── TODAY: the manual crawl ──
      const docs = uc.today.docs;
      const crawlP = seg(t0, k.crawl0, k.crawlDur);
      const pts: Pt[] = [{ x: B.x + B.r * 0.95, y: B.y + 20 }, ...pos.map(([x, y]) => ({ x: x - 190, y }))];
      if (crawlP > 0 && todayA > 0) {
        ctx.save();
        ctx.globalAlpha *= todayA;
        const segs = pts.length - 1;
        for (let i = 0; i < segs; i++) {
          const sp = clamp(crawlP * segs - i);
          if (sp <= 0) break;
          const c = bow(pts[i], pts[i + 1], i % 2 ? 0.18 : -0.18);
          curvePath(ctx, c, 0, sp);
          outline(ctx, { width: 2.5, color: INK.coral, dash: [2, 9], dashOffset: -T * 30 });
          if (sp < 1) {
            const h = onCurve(c, sp);
            circlePath(ctx, h.x, h.y, 9);
            ink(ctx, { color: INK.coral, flat: 1 });
          }
        }
        ctx.restore();
      }
      docs.forEach((d, i) => {
        const [x, y, rot] = pos[i];
        const ap = ease.backOut(seg(t0, k.docs0 + i * 0.22, 0.5));
        if (ap <= 0.001) return;
        const visited = clamp(crawlP * docs.length - i) >= 1;
        const fx = lerp(x, BRIEF.x, toGlean);
        const fy = lerp(y, BRIEF.y, toGlean);
        card(ctx, fx, fy, {
          w: 420, h: 88, logo: d.app, title: d.title, meta: d.meta, rot: rot * (1 - toGlean),
          scale: ap * lerp(1, 0.3, toGlean), alpha: 1 - toGlean, ring: visited && t1 <= 0 ? INK.coral : undefined, seed: i * 31 + 5,
        });
      });
      clock(ctx, 600, 735, 34, T, ease.backOut(seg(t0, k.crawl0, 0.5)) * todayA);
      if (todayA > 0) {
        ctx.save();
        ctx.globalAlpha *= todayA;
        stamp(ctx, uc.today.stamp, 1270, 985, { sub: uc.today.stampSub, size: 46, rot: -0.05, p: seg(t0, k.stamp0, 0.55), scrim: true });
        ctx.restore();
      }

      // ── WITH GLEAN: one cited answer ──
      if (t1 > 0) {
        const lp = ease.out(seg(t1, 0.25, 0.5));
        connector(ctx, { x: B.x + B.r + 24, y: B.y + 10 }, { x: BRIEF.x - BRIEF.w / 2 - 20, y: BRIEF.y - 120 }, lp, T, INK.blue, -0.1);
        chip(ctx, 'ASK GLEAN', 700, 470, { size: 14, align: 'center', bg: INK.blue, fg: INK.card, border: INK.navy, scale: ease.backOut(seg(t1, 0.35, 0.4)) });
        briefCard(ctx, BRIEF.x, BRIEF.y, BRIEF.w, uc.glean.header, uc.glean.rows, ease.out(seg(t1, 0.5, 0.6)), t1 - k.rows0, { agent: uc.glean.agent, T });
        stamp(ctx, uc.glean.stamp, 1500, 975, { sub: uc.glean.stampSub, size: 44, rot: -0.05, p: seg(t1, k.stamp1, 0.55), color: INK.blue, scrim: true });
      }
      void FONT;
    },
  };
}
