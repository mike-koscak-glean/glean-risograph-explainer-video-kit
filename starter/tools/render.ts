// Frame-by-frame render: Vite + a browser page that renders every frame
// deterministically and POSTs raw RGBA to this process → ffmpeg.
//
//   node tools/render.ts [--scale 1|2] [--fps 60] [--from s] [--to s] [--out file] [--draft] [--external]
//
// By default Playwright's headless Chromium opens the page. With --external
// the URL is printed and any browser tab can run the job.
import { createServer, type Plugin } from 'vite';
import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const SCALE = parseFloat(arg('scale', '1')!);
const FPS = parseFloat(arg('fps', '60')!);
const DRAFT = process.argv.includes('--draft');
const EXTERNAL = process.argv.includes('--external');
const SCHEDULE_ONLY = process.argv.includes('--schedule');
const FROM = parseFloat(arg('from', '0')!);
const TO = arg('to') ? parseFloat(arg('to')!) : null;
const OUT = resolve(arg('out', DRAFT ? 'out/draft.mp4' : SCALE >= 2 ? 'out/video-4k.mp4' : 'out/video.mp4')!);
mkdirSync(dirname(OUT), { recursive: true });
mkdirSync(resolve('out'), { recursive: true });

let ff: ChildProcess | null = null;
let total = 0;
let frames = 0;
let t0 = 0;
let resolveDone: () => void;
const done = new Promise<void>((r) => (resolveDone = r));

async function body(req: AsyncIterable<unknown>) {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks);
}

const sink: Plugin = {
  name: 'frame-sink',
  configureServer(server) {
    server.middlewares.use('/__job', (_req, res) => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ from: FROM, to: TO, fps: FPS, scale: SCALE, scheduleOnly: SCHEDULE_ONLY }));
    });
    server.middlewares.use('/__meta', async (req, res) => {
      const m = JSON.parse((await body(req)).toString());
      writeFileSync(resolve('out/schedule.json'), JSON.stringify(m.schedule, null, 2));
      total = m.frames;
      if (SCHEDULE_ONLY) {
        console.log(`schedule · ${m.schedule.total.toFixed(1)} s · ${m.schedule.slots.length} beats · ${m.schedule.sfx.length} sfx → out/schedule.json`);
        return void res.end('ok');
      }
      console.log(`render ${m.width}×${m.height} @${FPS} · ${m.from.toFixed(1)}–${m.to.toFixed(1)} s · ${total} frames → ${OUT}${m.schedule.estimated ? ' · (estimated VO timing)' : ''}`);
      const enc = DRAFT
        ? ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21']
        : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-tune', 'animation', '-x264-params', 'aq-mode=3'];
      ff = spawn(
        'ffmpeg',
        [
          '-y', '-loglevel', 'error',
          '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${m.width}x${m.height}`, '-r', String(FPS), '-i', '-',
          '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
          ...enc,
          '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
          '-movflags', '+faststart',
          OUT,
        ],
        { stdio: ['pipe', 'inherit', 'inherit'] },
      );
      t0 = Date.now();
      res.end('ok');
    });
    server.middlewares.use('/__frame', async (req, res) => {
      const buf = await body(req);
      if (ff && !ff.stdin!.write(buf)) await once(ff.stdin!, 'drain');
      frames++;
      if (frames % 30 === 0 || frames === total) {
        const el = (Date.now() - t0) / 1000;
        process.stdout.write(`\r  ${frames}/${total} frames · ${(frames / el).toFixed(1)} fps · eta ${((el / frames) * (total - frames)).toFixed(0)} s   `);
      }
      res.end('ok');
    });
    server.middlewares.use('/__done', async (_req, res) => {
      res.end('ok');
      if (!SCHEDULE_ONLY) process.stdout.write('\n');
      ff?.stdin!.end();
      if (ff) await once(ff, 'close');
      if (!SCHEDULE_ONLY) console.log(`done · ${frames} frames · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
      resolveDone();
    });
    server.middlewares.use('/__error', async (req, res) => {
      console.error('[page error]', (await body(req)).toString());
      res.end('ok');
      process.exit(1);
    });
  },
};

const server = await createServer({ configFile: false, root: process.cwd(), server: { port: 5299, host: '127.0.0.1' }, plugins: [sink], logLevel: 'error' });
await server.listen();
const url = `${server.resolvedUrls!.local[0]}?render&auto&scale=${SCALE}&fps=${FPS}`;

let browser: { close: () => Promise<void> } | null = null;
if (EXTERNAL) console.log(`open this URL in a browser tab to run the render:\n  ${url}`);
else {
  const { chromium } = await import('playwright');
  const b = await chromium.launch();
  browser = b;
  const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => console.error('[page]', e.message));
  await page.goto(url);
}
await done;
await browser?.close();
await server.close();
process.exit(0);
