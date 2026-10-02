// Step 7 · Agents — a workflow that works becomes a shared agent; agents act with approval.
import { INK, FONT, type Ctx, rrPath, ink, outline, paperFill, text, chip, card, stamp, circlePath, drawLogo, badge, sun, person } from '../ink';
import { ease, seg, lerp } from '../motion';
import { AGENT, UC_ACCOUNT, DANA, PRIYA, SAM, OMAR, KATE } from '../story';
import { tb, type Scene } from './types';
import { briefCard, connector, handover, persona } from './kit';

const AG = { x: 1000, y: 650, w: 540, h: 470 };

function panel(ctx: Ctx, x: number, y: number, w: number, h: number, seed: number, shadow: string = INK.blue) {
  rrPath(ctx, x - w / 2 + 10, y - h / 2 + 12, w, h, 18);
  ink(ctx, { tone: { color: shadow, level: 0.5, cell: 6 } });
  rrPath(ctx, x - w / 2, y - h / 2, w, h, 18);
  paperFill(ctx, INK.card);
  rrPath(ctx, x - w / 2, y - h / 2, w, h, 18);
  outline(ctx, { width: 3, offColor: INK.coral, seed });
}

function header(ctx: Ctx, x: number, y: number, w: number, label: string, logoKey: 'glean' | 'salesforce', tag?: string) {
  ctx.save();
  rrPath(ctx, x - w / 2, y, w, 80, 18);
  ctx.clip();
  ctx.fillStyle = logoKey === 'glean' ? INK.blue : INK.navy;
  ctx.fillRect(x - w / 2, y, w, 80);
  ctx.restore();
  circlePath(ctx, x - w / 2 + 44, y + 40, 24);
  paperFill(ctx, INK.card);
  drawLogo(ctx, logoKey, x - w / 2 + 44, y + 40, 30);
  text(ctx, label, x - w / 2 + 82, y + 49, { size: 24, weight: 800, family: FONT.display, color: INK.card });
  if (tag) chip(ctx, tag, x + w / 2 - 22, y + 40, { size: 13, align: 'right', bg: INK.lime, border: INK.navy });
}

export const agentsScene: Scene = {
  durations: [4.4, 5.2],
  focus: () => ({ x: AG.x, y: AG.y }),
  render(ctx, st) {
    const t0 = tb(st, 0);
    const t1 = tb(st, 1);
    const T = st.time;
    const keep = handover(t1, 0.5);

    // ── beat 1 · brief → agent → shared ──
    if (keep > 0) {
      ctx.save();
      ctx.globalAlpha *= keep;
      sun(ctx, AG.x, AG.y, 460 * ease.out(seg(t0, 0, 1.2)), INK.lime, { level: 0.06, cell: 13, alpha: 0.5 });
      briefCard(ctx, 400, 620, 540, UC_ACCOUNT.glean.header, UC_ACCOUNT.glean.rows.slice(0, 3), ease.out(seg(t0, 0.05, 0.5)), 9, { rowH: 70 });
      chip(ctx, 'IT WORKED ONCE', 400, 410, { size: 14, align: 'center', bg: INK.card, scale: ease.backOut(seg(t0, 0.4, 0.4)) });
      connector(ctx, { x: 680, y: 620 }, { x: AG.x - AG.w / 2 - 18, y: 620 }, ease.out(seg(t0, 0.6, 0.4)), T, INK.blue, 0.05);
      const ap = ease.backOut(seg(t0, 0.8, 0.55));
      if (ap > 0) {
        ctx.save();
        ctx.translate(AG.x, AG.y);
        ctx.scale(lerp(0.85, 1, ap), lerp(0.85, 1, ap));
        ctx.translate(-AG.x, -AG.y);
        ctx.globalAlpha *= Math.min(1, ap * 1.5);
        panel(ctx, AG.x, AG.y, AG.w, AG.h, 3);
        header(ctx, AG.x, AG.y - AG.h / 2, AG.w, AGENT.name, 'glean', 'AGENT');
        AGENT.steps.forEach((s, i) => {
          const sp = ease.out(seg(t0, 1.3 + i * 0.3, 0.4));
          if (sp <= 0) return;
          const y = AG.y - AG.h / 2 + 130 + i * 78;
          ctx.save();
          ctx.globalAlpha *= sp;
          circlePath(ctx, AG.x - AG.w / 2 + 50, y, 20);
          ink(ctx, { color: INK.blue, flat: 1 });
          text(ctx, String(i + 1), AG.x - AG.w / 2 + 50, y + 7, { size: 20, weight: 800, family: FONT.display, color: INK.card, align: 'center' });
          text(ctx, s, AG.x - AG.w / 2 + 88, y + 8, { size: 23, weight: 700 });
          badge(ctx, AG.x + AG.w / 2 - 44, y, 15, { bg: INK.lime, glyph: 'check', scale: ease.backOut(seg(t0, 1.5 + i * 0.3, 0.35)) });
          ctx.restore();
        });
        ctx.restore();
      }
      // shared with the team
      const team = [DANA, PRIYA, SAM, OMAR, KATE];
      team.forEach((c, i) => {
        const y = 420 + i * 120;
        const x = 1560 + (i % 2) * 120;
        const pp = seg(t0, 2.6 + i * 0.12, 0.5);
        connector(ctx, { x: AG.x + AG.w / 2 + 12, y: AG.y - 60 + i * 30 }, { x: x - 52, y: y - 34 }, ease.out(pp), T, INK.blue, 0.06, 2);
        person(ctx, x, y + 6, 34, c.style, { scale: ease.backOut(pp), time: T });
      });
      chip(ctx, 'SHARED WITH THE TEAM', 1620, 330, { size: 14, align: 'center', bg: INK.blue, fg: INK.card, border: INK.navy, scale: ease.backOut(seg(t0, 3.1, 0.4)) });
      chip(ctx, 'RUNS THE SAME WAY EVERY TIME', AG.x, AG.y + AG.h / 2 + 62, { size: 14, align: 'center', bg: INK.card, scale: ease.backOut(seg(t0, 3.3, 0.4)) });
      ctx.restore();
    }

    // ── beat 2 · call recap → Salesforce, with approval ──
    if (t1 > 0) {
      const SF = { x: 1390, y: 600, w: 640, h: 400 };
      card(ctx, 330, 560, { w: 400, h: 92, logo: 'gong', title: AGENT.recap.from, meta: 'Gong · call ended', scale: ease.backOut(seg(t1, 0.5, 0.5)), seed: 3 });
      connector(ctx, { x: 540, y: 560 }, { x: 700, y: 560 }, ease.out(seg(t1, 0.9, 0.35)), T, INK.blue, 0);
      // agent disc
      const dp = ease.elasticOut(seg(t1, 1.0, 0.9));
      if (dp > 0) {
        circlePath(ctx, 800 + 8, 560 + 9, 92 * dp);
        ink(ctx, { tone: { color: INK.navy, level: 0.45, cell: 6 } });
        circlePath(ctx, 800, 560, 92 * dp);
        paperFill(ctx, INK.blue);
        circlePath(ctx, 800, 560, 92 * dp);
        outline(ctx, { width: 3, offColor: INK.coral, seed: 5 });
        circlePath(ctx, 800, 560, 112 * dp);
        outline(ctx, { width: 2.5, color: INK.blue, dash: [8, 8], dashOffset: -T * 20 });
        circlePath(ctx, 800, 540, 38 * dp);
        paperFill(ctx, INK.card);
        drawLogo(ctx, 'glean', 800, 540, 50 * dp);
        text(ctx, 'AGENT', 800, 610, { size: 15, family: FONT.mono, spacing: 2, color: INK.card, align: 'center', alpha: dp });
      }
      chip(ctx, 'DRAFTS THE RECAP', 800, 700, { size: 14, align: 'center', bg: INK.lime, scale: ease.backOut(seg(t1, 1.5, 0.4)) });
      connector(ctx, { x: 905, y: 560 }, { x: SF.x - SF.w / 2 - 18, y: 560 }, ease.out(seg(t1, 1.6, 0.35)), T, INK.blue, 0);
      const pp = ease.backOut(seg(t1, 1.8, 0.5));
      if (pp > 0) {
        ctx.save();
        ctx.globalAlpha *= Math.min(1, pp * 1.5);
        panel(ctx, SF.x, SF.y, SF.w, SF.h, 8, INK.navy);
        header(ctx, SF.x, SF.y - SF.h / 2, SF.w, 'Update Northstar opportunity?', 'salesforce');
        AGENT.recap.fields.forEach((f, i) => {
          const fp = ease.out(seg(t1, 2.2 + i * 0.3, 0.35));
          const y = SF.y - SF.h / 2 + 126 + i * 62;
          text(ctx, f, SF.x - SF.w / 2 + 40, y + 8, { size: 22, weight: 700, alpha: fp });
          chip(ctx, 'DRAFT', SF.x + SF.w / 2 - 34, y, { size: 12, align: 'right', bg: INK.paper, scale: fp });
        });
        // approve button
        const press = seg(t1, 3.7, 0.25);
        const bs = 1 - Math.sin(press * Math.PI) * 0.08;
        const bx = SF.x + SF.w / 2 - 130;
        const by = SF.y + SF.h / 2 - 52;
        ctx.save();
        ctx.translate(bx, by);
        ctx.scale(bs, bs);
        rrPath(ctx, -100, -28, 200, 56, 28);
        ink(ctx, { color: press >= 1 ? INK.lime : INK.card, flat: 1 });
        rrPath(ctx, -100, -28, 200, 56, 28);
        outline(ctx, { width: 2.5, color: INK.navy });
        text(ctx, press >= 1 ? 'Approved' : 'Approve', 0, 8, { size: 22, weight: 800, family: FONT.display, align: 'center' });
        ctx.restore();
        if (press >= 1) badge(ctx, bx + 104, by - 26, 17, { bg: INK.lime, glyph: 'check', scale: ease.backOut(seg(t1, 3.95, 0.35)) });
        ctx.restore();
      }
      persona(ctx, DANA, 1830, 960, t1 - 2.8, T, 50);
      stamp(ctx, 'A PERSON APPROVES EVERY CHANGE', 900, 960, { size: 40, rot: -0.04, p: seg(t1, 4.2, 0.55), color: INK.blue, scrim: true });
    }
  },
};
