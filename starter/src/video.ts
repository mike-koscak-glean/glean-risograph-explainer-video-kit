// ─────────────────────────────────────────────────────────────
//  Video engine. Same scenes as the click-through story, but a
//  timeline (narration-driven) advances the beats.
//
//  Modes
//   /            preview: real-time playback (with /gen/mix.wav if present)
//   /?render     driven frame-by-frame by tools/render.ts
//   #t=42.5      start preview at 42.5 s
// ─────────────────────────────────────────────────────────────
import { INK, FONT, W, H, type Ctx, buildPaper, drawPaper, drawGrain, setBoilTime, text, measure, circlePath, drawLogo } from './ink';
import { ease, seg, clamp, lerp } from './motion';
import { preloadLogos } from './logos';
import { STEPS } from './story';
import { SCENES } from './scenes';
import type { SceneState } from './scenes/types';
import { buildSchedule, TIMING, type Schedule, type VoInfo } from './timeline';

const params = new URLSearchParams(location.search);
const RENDER = params.has('render');
const SCALE = parseFloat(params.get('scale') ?? '1'); // 1 = 1080p, 2 = 4K
const FPS = parseFloat(params.get('fps') ?? '60');

const canvas = document.getElementById('stage') as HTMLCanvasElement;
const ctx = canvas.getContext('2d', { willReadFrequently: RENDER })!;

// ── Sizing ───────────────────────────────────────────────────
const view = { s: 1, ox: 0, oy: 0, dpr: 1 };
function resize() {
  if (RENDER) {
    canvas.width = W * SCALE;
    canvas.height = H * SCALE;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    view.dpr = 1;
    view.s = SCALE;
    view.ox = 0;
    view.oy = 0;
    return;
  }
  view.dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(innerWidth * view.dpr);
  canvas.height = Math.round(innerHeight * view.dpr);
  view.s = Math.min(innerWidth / W, innerHeight / H);
  view.ox = (innerWidth - W * view.s) / 2;
  view.oy = (innerHeight - H * view.s) / 2;
}
if (!RENDER) addEventListener('resize', () => { resize(); buildPaper(view.dpr * view.s); });
resize();

// ── State ────────────────────────────────────────────────────
let sched: Schedule;
let states: SceneState[];
let step: number;
let slotIdx: number;
let clock: number;
let trans: { from: number; to: number; t: number } | null;
const TRANS_DUR = 1.05;

function reset() {
  states = SCENES.map((s) => ({ beat: 0, bt: s.durations.map(() => 0), time: 0 }));
  step = 0;
  slotIdx = 0;
  clock = 0;
  trans = null;
}

function enterSlot(k: number) {
  const s = sched.slots[k];
  if (s.step !== step) {
    trans = { from: step, to: s.step, t: 0 };
    step = s.step;
  }
  states[step].beat = s.beat;
  slotIdx = k;
}

function update(dt: number) {
  clock += dt;
  while (slotIdx < sched.slots.length - 1 && clock >= sched.slots[slotIdx + 1].start) enterSlot(slotIdx + 1);
  const st = states[step];
  st.time = clock;
  const gate = !trans || trans.t > TIMING.transGate / TRANS_DUR;
  // every beat up to the current one keeps running, so nothing ever snaps
  if (gate) for (let i = 0; i <= st.beat; i++) st.bt[i] += dt;
  if (trans) {
    trans.t += dt / TRANS_DUR;
    states[trans.from].time = clock;
    // let the outgoing scene keep breathing while it zooms away
    const fs = states[trans.from];
    for (let i = 0; i <= fs.beat; i++) fs.bt[i] += dt;
    if (trans.t >= 1) trans = null;
  }
}

// ── Titles ───────────────────────────────────────────────────
const TITLE = { x: 110, kick: 108, title: 178, sub: 226 };

function drawChrome(c: Ctx, sIdx: number, st: SceneState) {
  const copy = STEPS[sIdx];
  if (!copy.kicker) return;
  const last = sIdx === SCENES.length - 1 && st.beat === SCENES[sIdx].durations.length - 1;
  const chromeA = last ? 1 - ease.out(seg(st.bt[st.beat], 0, 0.8)) : 1;
  circlePath(c, TITLE.x + 7, TITLE.kick - 6, 7);
  c.fillStyle = INK.coral;
  c.globalAlpha = chromeA;
  c.fill();
  c.globalAlpha = 1;
  text(c, `${String(sIdx).padStart(2, '0')} — ${copy.kicker.toUpperCase()}`, TITLE.x + 26, TITLE.kick, { size: 16, family: FONT.mono, spacing: 2.5, weight: 500, alpha: chromeA });
  // co-brand lockup, top right
  drawLogo(c, 'gleanText', W - 318, TITLE.kick - 8, 84, chromeA);
  text(c, '×', W - 250, TITLE.kick + 1, { size: 26, weight: 500, family: FONT.display, align: 'center', alpha: chromeA * 0.7 });
  drawLogo(c, 'exampleco', W - 168, TITLE.kick - 6, 132, chromeA);
  copy.beats.forEach((b, i) => {
    const t = st.bt[i];
    if (i > st.beat) return;
    let a: number;
    let dy: number;
    if (i === st.beat) {
      const p = ease.outQuint(seg(t, 0, 0.7));
      a = p;
      dy = lerp(26, 0, p);
    } else {
      const nt = st.bt[i + 1];
      const p = ease.out(seg(nt, 0, 0.35));
      a = 1 - p;
      dy = lerp(0, -18, p);
    }
    if (a <= 0.01 || !b.title) return;
    let size = 64;
    while (measure(c, b.title, size, 800, FONT.display) > W - 260 && size > 40) size -= 2;
    text(c, b.title, TITLE.x, TITLE.title + dy, { size, weight: 800, family: FONT.display, alpha: a, offColor: INK.coral, offAmt: 1.8 });
    if (b.sub) {
      const sp = i === st.beat ? ease.out(seg(t, 0.25, 0.7)) : a;
      text(c, b.sub, TITLE.x + 2, TITLE.sub + dy * 0.6, { size: 24, weight: 500, alpha: 0.78 * Math.min(a, sp) });
    }
  });
}

function drawScene(c: Ctx, i: number) {
  drawPaper(c);
  const st = states[i];
  c.save();
  SCENES[i].render(c, st);
  c.restore();
  drawChrome(c, i, st);
}

function frame() {
  const v = view;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#e6dcc6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(v.dpr * v.s, 0, 0, v.dpr * v.s, v.dpr * v.ox, v.dpr * v.oy);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();
  setBoilTime(clock);
  if (!trans) drawScene(ctx, step);
  else {
    const p = ease.inOut(clamp(trans.t));
    const fIn = SCENES[trans.to].focus(states[trans.to]);
    const fOut = SCENES[trans.from].focus(states[trans.from]);
    ctx.save();
    const z = 1 + p * 0.12;
    ctx.translate(fOut.x, fOut.y);
    ctx.scale(z, z);
    ctx.translate(-fOut.x, -fOut.y);
    drawScene(ctx, trans.from);
    ctx.restore();
    const r = Math.hypot(W, H) * p;
    ctx.save();
    circlePath(ctx, fIn.x, fIn.y, r);
    ctx.clip();
    drawScene(ctx, trans.to);
    ctx.restore();
    irisRing(ctx, fIn.x, fIn.y, r, p);
  }
  drawGrain(ctx);
  ctx.restore();
}

function irisRing(c: Ctx, x: number, y: number, r: number, p: number) {
  if (r < 2) return;
  const a = Math.sin(clamp(p) * Math.PI);
  c.save();
  c.globalCompositeOperation = 'multiply';
  c.globalAlpha = a;
  c.lineWidth = 14;
  c.strokeStyle = INK.coral;
  circlePath(c, x + 5, y + 4, r);
  c.stroke();
  c.lineWidth = 6;
  c.strokeStyle = INK.blue;
  circlePath(c, x, y, r + 12);
  c.stroke();
  c.restore();
}

/** Deterministic seek: re-simulate from 0 at the render frame rate. */
function seek(t: number) {
  reset();
  const dt = 1 / FPS;
  const n = Math.round(t * FPS);
  for (let i = 0; i < n; i++) update(dt);
}

// ── Render-mode API (used by tools/render.ts) ────────────────
declare global {
  interface Window {
    __video?: {
      ready: boolean;
      schedule: Schedule;
      fps: number;
      width: number;
      height: number;
      seek: (t: number) => void;
      renderFrames: (n: number, sink: string) => Promise<void>;
    };
  }
}

async function renderFrames(n: number, sink: string) {
  const dt = 1 / FPS;
  for (let i = 0; i < n; i++) {
    frame();
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const res = await fetch(sink, { method: 'POST', body: img.data });
    if (!res.ok) throw new Error(`frame sink ${res.status}`);
    update(dt);
  }
}

/** Self-driven render job: fetch the job, render every frame, POST to the sink. */
async function runJob() {
  const job = await fetch('/__job').then((r) => r.json());
  const from: number = job.from ?? 0;
  const to: number = Math.min(job.to ?? sched.total, sched.total);
  const frames = job.scheduleOnly ? 0 : Math.round((to - from) * FPS);
  await fetch('/__meta', {
    method: 'POST',
    body: JSON.stringify({ schedule: sched, width: canvas.width, height: canvas.height, from, to, frames }),
  });
  seek(from);
  for (let done = 0; done < frames; done += 30) {
    await renderFrames(Math.min(30, frames - done), '/__frame');
    document.title = `render ${Math.min(frames, done + 30)}/${frames}`;
  }
  await fetch('/__done', { method: 'POST' });
  document.title = 'render done';
}

// ── Preview-mode HUD ─────────────────────────────────────────
function mmss(t: number) {
  const m = Math.floor(t / 60);
  return `${m}:${(t - m * 60).toFixed(1).padStart(4, '0')}`;
}

async function startPreview() {
  const hud = document.getElementById('hud')!;
  hud.hidden = false;
  const audio = new Audio('/gen/mix.wav');
  let hasAudio = false;
  audio.addEventListener('canplaythrough', () => (hasAudio = true), { once: true });
  audio.load();
  let playing = false;
  let last = performance.now();
  const start = parseFloat(location.hash.match(/t=([\d.]+)/)?.[1] ?? '0');
  seek(start);

  const toggle = () => {
    playing = !playing;
    if (playing && hasAudio) {
      audio.currentTime = clock;
      audio.play().catch(() => undefined);
    } else audio.pause();
    last = performance.now();
  };
  const jump = (t: number) => {
    seek(clamp(t, 0, sched.total));
    if (hasAudio) audio.currentTime = clock;
  };
  addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      toggle();
    } else if (e.key === 'ArrowRight') jump(clock + 5);
    else if (e.key === 'ArrowLeft') jump(clock - 5);
    else if (e.key === 'Home') jump(0);
    else if (/^[0-9]$/.test(e.key)) {
      const s = sched.slots.find((x) => x.step === parseInt(e.key, 10));
      if (s) jump(s.start);
    } else if (e.key === 'f') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.();
    }
  });
  canvas.addEventListener('click', toggle);

  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (playing) {
      if (hasAudio && !audio.paused) {
        // lock the picture to the audio clock
        const target = audio.currentTime;
        while (clock < target - 1 / 120) update(Math.min(1 / 60, target - clock));
      } else update(dt);
      if (clock >= sched.total) playing = false;
    }
    frame();
    const s = sched.slots[slotIdx];
    hud.textContent = `${playing ? '▶' : '❚❚'}  ${mmss(clock)} / ${mmss(sched.total)}   ·   ${s.id}   ·   ${sched.estimated ? 'estimated timing (no VO yet)' : 'VO timing'}${hasAudio ? '' : ' · no audio'}   ·   space play · ←/→ 5s · 0–6 steps`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// ── Boot ─────────────────────────────────────────────────────
(async () => {
  const fonts = Promise.all([
    document.fonts.load(`800 64px ${FONT.display}`),
    document.fonts.load(`500 20px ${FONT.sans}`),
    document.fonts.load(`700 20px ${FONT.sans}`),
    document.fonts.load(`400 16px ${FONT.mono}`),
    document.fonts.load(`500 16px ${FONT.mono}`),
  ]).catch(() => undefined);
  const vo: VoInfo | null = await fetch('/gen/vo.json')
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  sched = buildSchedule(vo);
  await Promise.all([fonts, preloadLogos()]);
  await document.fonts.ready;
  buildPaper(view.dpr * view.s);
  reset();
  document.getElementById('loading')!.classList.add('gone');
  if (RENDER) {
    window.__video = { ready: true, schedule: sched, fps: FPS, width: canvas.width, height: canvas.height, seek, renderFrames };
    document.body.classList.add('render');
    if (params.has('auto')) runJob().catch((e) => fetch('/__error', { method: 'POST', body: String(e?.stack ?? e) }));
  } else startPreview();
})();
