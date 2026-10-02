// Logo opener (frame 0 = the file's still image) → title card · "Where good AI answers come from."
import { INK, FONT, type Ctx, blobPath, circlePath, ink, outline, paperFill, text, sticker, sun, drawLogo, measure } from '../ink';
import { logo } from '../logos';
import { ease, seg } from '../motion';
import { RING_APPS } from '../story';
import type { Scene } from './types';

const Q = { x: 1400, y: 560, r: 210 };
/** Seconds of logo opener before the title card starts animating. */
export const OPENER = 1.5;

// coral copy of the wordmark for the misregistered second ink pass
let coralMark: HTMLCanvasElement | null = null;
function coralLogo(): HTMLCanvasElement | null {
  if (coralMark) return coralMark;
  const img = logo('gleanText');
  if (!img || !img.naturalWidth) return null;
  const c = document.createElement('canvas');
  c.width = 1200;
  c.height = Math.round((1200 * img.naturalHeight) / img.naturalWidth);
  const g = c.getContext('2d')!;
  g.drawImage(img, 0, 0, c.width, c.height);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = INK.coral;
  g.fillRect(0, 0, c.width, c.height);
  return (coralMark = c);
}

function drawOpener(ctx: Ctx, t: number, T: number) {
  const out = ease.inOut(seg(t, OPENER - 0.55, 0.5));
  if (out >= 1) return;
  const a = 1 - out;
  const z = 1 - 0.1 * out;
  ctx.save();
  ctx.translate(960, 520);
  ctx.scale(z, z);
  sun(ctx, 0, 0, 470 * (1 - 0.4 * out), INK.lime, { level: 0.08, cell: 13, alpha: 0.85 * a });
  // co-brand lockup: glean × exampleco
  const GW = 470;
  const FW = 560;
  const GAP = 130;
  const gx = -(GW + GAP + FW) / 2 + GW / 2;
  const fxX = gx + GW / 2 + GAP + FW / 2;
  const cm = coralLogo();
  if (cm) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.55 * a;
    const h = (GW * cm.height) / cm.width;
    ctx.drawImage(cm, gx - GW / 2 + 7 + Math.sin(T * 2) * 0.8, -h / 2 + 6, GW, h);
    ctx.restore();
  }
  drawLogo(ctx, 'gleanText', gx, 0, GW, a);
  text(ctx, '×', gx + GW / 2 + GAP / 2, 30, { size: 92, weight: 500, family: FONT.display, align: 'center', alpha: a * 0.75 });
  drawLogo(ctx, 'exampleco', fxX, 14, FW, a);
  const label = 'PREPARED FOR EXAMPLECO · PILOT PROPOSAL';
  const lw = measure(ctx, label, 20, 500, FONT.mono) + 3.5 * (label.length - 1);
  const x0 = -(lw + 22) / 2;
  circlePath(ctx, x0 + 7, 196, 7);
  ink(ctx, { color: INK.fx, flat: 1, alpha: a });
  text(ctx, label, x0 + 22, 202, { size: 20, family: FONT.mono, spacing: 3.5, weight: 500, alpha: a });
  ctx.restore();
}

export const titleScene: Scene = {
  durations: [4.0 + OPENER],
  focus: () => ({ x: Q.x, y: Q.y }),
  render(ctx: Ctx, st) {
    const T = st.time;
    drawOpener(ctx, st.bt[0], T);
    const t = st.bt[0] - OPENER;
    if (t <= 0) return;

    sun(ctx, Q.x, Q.y, 470 * ease.out(seg(t, 0, 1.4)), INK.lime, { level: 0.08, cell: 13, alpha: 0.85 });

    // orbit ring + app stickers
    const op = ease.out(seg(t, 0.5, 0.8));
    if (op > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(Q.x, Q.y, 340, 300, 0, 0, Math.PI * 2);
      outline(ctx, { width: 2, alpha: 0.35 * op, dash: [4, 10], dashOffset: -T * 12 });
      ctx.restore();
    }
    RING_APPS.forEach((key, i) => {
      const a = (i / RING_APPS.length) * Math.PI * 2 - Math.PI / 2 + T * 0.07;
      const s = ease.backOut(seg(t, 0.8 + i * 0.07, 0.5));
      sticker(ctx, key, Q.x + Math.cos(a) * 340, Q.y + Math.sin(a) * 300, 30, { scale: s, seed: i + 200 });
    });

    // the question blob
    const bp = ease.elasticOut(seg(t, 0.25, 1.3));
    if (bp > 0) {
      const r = Q.r * bp;
      blobPath(ctx, Q.x + 12, Q.y + 14, r, 7, 0.05, T);
      ink(ctx, { tone: { color: INK.blue, level: 0.5, cell: 7 } });
      blobPath(ctx, Q.x, Q.y, r, 7, 0.05, T);
      paperFill(ctx, INK.card);
      blobPath(ctx, Q.x, Q.y, r, 7, 0.05, T);
      ink(ctx, { color: INK.coral, flat: 1, tone: { color: INK.coral, level: 0.35, cell: 7, alpha: 0.6 } });
      blobPath(ctx, Q.x, Q.y, r, 7, 0.05, T);
      outline(ctx, { width: 4, offColor: INK.blue, seed: 7 });
      const qp = ease.backOut(seg(t, 0.6, 0.6));
      text(ctx, '?', Q.x + 6, Q.y + 95 * qp + (1 - qp) * 40, { size: 270 * qp, weight: 800, family: FONT.display, align: 'center', color: INK.card, offColor: INK.navy, offAmt: 3, alpha: qp });
    }

    // title block
    const X = 150;
    // kicker
    const kp = ease.out(seg(t, 0.2, 0.6));
    circlePath(ctx, X + 7, 352, 7);
    ink(ctx, { color: INK.fx, flat: 1, alpha: kp });
    text(ctx, 'GLEAN × EXAMPLECO', X + 26, 358, { size: 18, family: FONT.mono, spacing: 3, weight: 500, alpha: kp });
    ['One front door', 'for the whole', 'customer journey.'].forEach((ln, i) => {
      const p = ease.outQuint(seg(t, 0.35 + i * 0.14, 0.8));
      text(ctx, ln, X, 488 + i * 118 + (1 - p) * 40, { size: 104, weight: 800, family: FONT.display, alpha: p, offColor: INK.coral, offAmt: 2.6 });
    });
    const sp = ease.out(seg(t, 1.1, 0.8));
    text(ctx, 'How Glean would work for ExampleCo, and how the pilot proves it.', X + 3, 830, { size: 28, weight: 500, alpha: 0.78 * sp });
  },
};
