import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';

interface ReviewFrame {
  id: string;
  title: string;
  image: string;
  takeaway?: string;
  onScreenCopy?: string;
  evidenceStatus?: string;
  notes?: string;
}

interface ReviewManifest {
  title?: string;
  summary?: string;
  storyboardFile?: string;
  contactSheet?: string;
  frames: ReviewFrame[];
}

function arg(name: string, fallback: string): string {
  const at = process.argv.indexOf(`--${name}`);
  return at >= 0 && process.argv[at + 1] ? process.argv[at + 1] : fallback;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
}

const cwd = process.cwd();
const manifestPath = resolve(cwd, arg('manifest', 'project/storyboard-review.json'));
const outDir = resolve(cwd, arg('out', 'out/storyboard-review'));
const assetsDir = resolve(outDir, 'assets');

if (!existsSync(manifestPath)) {
  throw new Error(`Missing storyboard review manifest: ${manifestPath}`);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ReviewManifest;
if (!Array.isArray(manifest.frames) || manifest.frames.length === 0) {
  throw new Error('Add at least one rendered style frame to project/storyboard-review.json before building the gallery.');
}

rmSync(assetsDir, { recursive: true, force: true });
mkdirSync(assetsDir, { recursive: true });

function copyImage(source: string, prefix: string): string {
  const src = resolve(cwd, source);
  if (!existsSync(src)) throw new Error(`Missing review image: ${src}`);
  const extension = extname(src).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.webp'].includes(extension)) {
    throw new Error(`Unsupported review image type: ${src}`);
  }
  const file = `${safeName(prefix)}-${safeName(basename(src))}`;
  const dest = resolve(assetsDir, file);
  if (src !== dest) copyFileSync(src, dest);
  return `assets/${file}`;
}

const contactSheet = manifest.contactSheet
  ? copyImage(manifest.contactSheet, 'contact-sheet')
  : '';

const frames = manifest.frames.map((frame, index) => ({
  ...frame,
  galleryImage: copyImage(frame.image, `${String(index + 1).padStart(2, '0')}-${frame.id || 'frame'}`),
}));

let storyboard = '';
if (manifest.storyboardFile) {
  const storyboardPath = resolve(cwd, manifest.storyboardFile);
  if (!existsSync(storyboardPath)) throw new Error(`Missing storyboard file: ${storyboardPath}`);
  storyboard = readFileSync(storyboardPath, 'utf8');
}

const frameCards = frames.map((frame) => `
  <article class="card">
    <a href="${escapeHtml(frame.galleryImage)}" target="_blank" rel="noreferrer">
      <img src="${escapeHtml(frame.galleryImage)}" alt="${escapeHtml(`${frame.id}: ${frame.title}`)}">
    </a>
    <div class="card-copy">
      <div class="frame-id">${escapeHtml(frame.id)}</div>
      <h3>${escapeHtml(frame.title)}</h3>
      ${frame.takeaway ? `<p><strong>Audience takeaway</strong><br>${escapeHtml(frame.takeaway)}</p>` : ''}
      ${frame.onScreenCopy ? `<p><strong>On-screen copy</strong><br>${escapeHtml(frame.onScreenCopy)}</p>` : ''}
      ${frame.evidenceStatus ? `<span class="badge">${escapeHtml(frame.evidenceStatus)}</span>` : ''}
      ${frame.notes ? `<p class="notes">${escapeHtml(frame.notes)}</p>` : ''}
    </div>
  </article>`).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(manifest.title || 'Visual storyboard review')}</title>
  <style>
    :root { --paper:#f3eedf; --ink:#17204f; --coral:#f06449; --lime:#c8dc38; --cyan:#0a9bc2; --muted:#5d6477; }
    * { box-sizing: border-box; }
    body { margin:0; color:var(--ink); background:var(--paper); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    header { padding:48px clamp(24px,5vw,72px) 36px; border-bottom:2px solid rgba(23,32,79,.16); background:radial-gradient(circle at 82% 20%,rgba(200,220,56,.45),transparent 28%),var(--paper); }
    .eyebrow,.frame-id { color:var(--cyan); font:700 12px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.16em; text-transform:uppercase; }
    h1 { max-width:1000px; margin:12px 0 10px; font-size:clamp(34px,5vw,68px); line-height:.98; letter-spacing:-.045em; text-shadow:3px 3px 0 rgba(240,100,73,.55); }
    header p { max-width:900px; margin:0; color:var(--muted); font-size:18px; line-height:1.55; }
    main { width:min(1500px,94vw); margin:0 auto; padding:36px 0 72px; }
    section { margin:0 0 46px; }
    h2 { margin:0 0 18px; font-size:clamp(24px,3vw,38px); }
    .contact { width:100%; display:block; border:2px solid var(--ink); box-shadow:8px 8px 0 var(--coral); background:#fff; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(430px,100%),1fr)); gap:28px; }
    .card { overflow:hidden; border:2px solid var(--ink); background:rgba(255,255,255,.62); box-shadow:7px 7px 0 var(--lime); }
    .card img { width:100%; aspect-ratio:16/9; object-fit:cover; display:block; background:#ded8c8; border-bottom:2px solid var(--ink); }
    .card-copy { padding:20px; }
    h3 { margin:7px 0 16px; font-size:24px; }
    p { line-height:1.5; }
    .badge { display:inline-block; padding:5px 9px; border:1px solid var(--ink); background:#fff; font:700 11px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; }
    .notes { color:var(--muted); }
    pre { margin:0; padding:24px; overflow:auto; white-space:pre-wrap; border:2px solid var(--ink); background:rgba(255,255,255,.55); font:13px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace; }
    footer { padding:24px; text-align:center; color:var(--muted); border-top:1px solid rgba(23,32,79,.16); }
  </style>
</head>
<body>
  <header>
    <div class="eyebrow">Visual storyboard review</div>
    <h1>${escapeHtml(manifest.title || 'Visual storyboard review')}</h1>
    <p>${escapeHtml(manifest.summary || 'Review the visual direction and representative frames before production begins.')}</p>
  </header>
  <main>
    ${contactSheet ? `<section><h2>Contact sheet</h2><a href="${escapeHtml(contactSheet)}" target="_blank" rel="noreferrer"><img class="contact" src="${escapeHtml(contactSheet)}" alt="Storyboard contact sheet"></a></section>` : ''}
    <section><h2>Representative style frames</h2><div class="grid">${frameCards}</div></section>
    ${storyboard ? `<section><h2>Storyboard source</h2><pre>${escapeHtml(storyboard)}</pre></section>` : ''}
  </main>
  <footer>Generated locally for review · ${escapeHtml(new Date().toLocaleString())}</footer>
</body>
</html>`;

mkdirSync(outDir, { recursive: true });
const output = resolve(outDir, 'index.html');
writeFileSync(output, html);
console.log(`Storyboard review gallery: ${output}`);
console.log(`Frames: ${frames.length}${contactSheet ? ' + contact sheet' : ''}`);
