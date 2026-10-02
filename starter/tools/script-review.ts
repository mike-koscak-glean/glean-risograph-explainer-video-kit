import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface ScriptBeat {
  id: string;
  storyboardBeat: string;
  narration: string;
  expectedSeconds?: number;
  deliveryText?: string;
  pronunciationNotes?: string;
}

interface ScriptReviewManifest {
  title?: string;
  summary?: string;
  targetDuration: string;
  estimatedDuration?: string;
  targetWordsPerMinute?: number;
  voice?: string;
  model?: string;
  beats: ScriptBeat[];
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

function wordCount(value: string): number {
  return value.trim().match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

function formatDuration(seconds: number): string {
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return minutes ? `${minutes}:${String(remainder).padStart(2, '0')}` : `${remainder} sec`;
}

const cwd = process.cwd();
const manifestPath = resolve(cwd, arg('manifest', 'project/script-review.json'));
const outDir = resolve(cwd, arg('out', 'out/script-review'));

if (!existsSync(manifestPath)) {
  throw new Error(`Missing script review manifest: ${manifestPath}`);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ScriptReviewManifest;
if (!Array.isArray(manifest.beats) || manifest.beats.length === 0) {
  throw new Error('Add the complete clean narration to project/script-review.json before building the review page.');
}

for (const beat of manifest.beats) {
  if (!beat.id || !beat.storyboardBeat || !beat.narration) {
    throw new Error('Every script beat requires id, storyboardBeat, and narration.');
  }
}

const words = manifest.beats.reduce((total, beat) => total + wordCount(beat.narration), 0);
const expectedSeconds = manifest.beats.every((beat) => typeof beat.expectedSeconds === 'number')
  ? manifest.beats.reduce((total, beat) => total + (beat.expectedSeconds ?? 0), 0)
  : 0;
const targetWpm = manifest.targetWordsPerMinute ?? 160;
const calculatedDuration = expectedSeconds || (words / targetWpm) * 60;
const estimatedDuration = manifest.estimatedDuration || formatDuration(calculatedDuration);

const cleanRead = manifest.beats.map((beat) => `
  <article class="read-beat">
    <div class="beat-id">${escapeHtml(beat.id)} · ${escapeHtml(beat.storyboardBeat)}</div>
    <p>${escapeHtml(beat.narration)}</p>
  </article>`).join('\n');

const detailCards = manifest.beats.map((beat) => `
  <article class="detail-card">
    <div class="beat-id">${escapeHtml(beat.id)}</div>
    <h3>${escapeHtml(beat.storyboardBeat)}</h3>
    <p class="narration">${escapeHtml(beat.narration)}</p>
    <div class="metadata">
      <span>${wordCount(beat.narration)} words</span>
      ${typeof beat.expectedSeconds === 'number' ? `<span>${escapeHtml(formatDuration(beat.expectedSeconds))}</span>` : ''}
    </div>
    ${beat.pronunciationNotes ? `<p><strong>Pronunciation</strong><br>${escapeHtml(beat.pronunciationNotes)}</p>` : ''}
    ${beat.deliveryText && beat.deliveryText !== beat.narration ? `<details><summary>ElevenLabs delivery text</summary><p>${escapeHtml(beat.deliveryText)}</p></details>` : ''}
  </article>`).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(manifest.title || 'Spoken script review')}</title>
  <style>
    :root { --paper:#f3eedf; --ink:#17204f; --coral:#f06449; --lime:#c8dc38; --cyan:#0a9bc2; --muted:#5d6477; }
    * { box-sizing:border-box; }
    body { margin:0; color:var(--ink); background:var(--paper); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    header { padding:48px clamp(24px,5vw,72px) 36px; border-bottom:2px solid rgba(23,32,79,.16); background:radial-gradient(circle at 84% 15%,rgba(200,220,56,.48),transparent 27%),var(--paper); }
    .eyebrow,.beat-id { color:var(--cyan); font:700 12px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.14em; text-transform:uppercase; }
    h1 { max-width:1000px; margin:12px 0 10px; font-size:clamp(34px,5vw,66px); line-height:1; letter-spacing:-.045em; text-shadow:3px 3px 0 rgba(240,100,73,.5); }
    header > p { max-width:880px; color:var(--muted); font-size:18px; line-height:1.55; }
    main { width:min(1120px,92vw); margin:0 auto; padding:34px 0 72px; }
    .metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:14px; margin:0 0 42px; }
    .metric { padding:18px; border:2px solid var(--ink); background:rgba(255,255,255,.58); box-shadow:5px 5px 0 var(--lime); }
    .metric strong { display:block; margin-top:7px; font-size:24px; }
    section { margin:0 0 46px; }
    h2 { margin:0 0 18px; font-size:clamp(25px,3vw,38px); }
    .read-through { padding:clamp(24px,4vw,48px); border:2px solid var(--ink); background:rgba(255,255,255,.66); box-shadow:8px 8px 0 var(--coral); }
    .read-beat { margin:0 0 28px; }
    .read-beat:last-child { margin-bottom:0; }
    .read-beat p { margin:8px 0 0; font:500 clamp(19px,2.2vw,27px)/1.55 Georgia,"Times New Roman",serif; }
    .detail-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(420px,100%),1fr)); gap:20px; }
    .detail-card { padding:22px; border:2px solid var(--ink); background:rgba(255,255,255,.55); }
    h3 { margin:7px 0 14px; font-size:22px; }
    .narration { font-size:17px; line-height:1.55; }
    .metadata { display:flex; gap:8px; flex-wrap:wrap; margin:16px 0; }
    .metadata span { padding:5px 9px; border:1px solid var(--ink); background:#fff; font:700 11px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; }
    details { margin-top:16px; }
    summary { cursor:pointer; font-weight:700; }
    .approval { padding:22px; border-left:8px solid var(--cyan); background:rgba(10,155,194,.1); line-height:1.6; }
    footer { padding:24px; text-align:center; color:var(--muted); border-top:1px solid rgba(23,32,79,.16); }
  </style>
</head>
<body>
  <header>
    <div class="eyebrow">Spoken script review</div>
    <h1>${escapeHtml(manifest.title || 'Spoken script review')}</h1>
    <p>${escapeHtml(manifest.summary || 'Review every spoken word and the expected duration before narration is generated.')}</p>
  </header>
  <main>
    <div class="metrics">
      <div class="metric"><div class="eyebrow">Target</div><strong>${escapeHtml(manifest.targetDuration)}</strong></div>
      <div class="metric"><div class="eyebrow">Estimated</div><strong>${escapeHtml(estimatedDuration)}</strong></div>
      <div class="metric"><div class="eyebrow">Words</div><strong>${words}</strong></div>
      <div class="metric"><div class="eyebrow">Beats</div><strong>${manifest.beats.length}</strong></div>
      <div class="metric"><div class="eyebrow">Target pace</div><strong>${targetWpm} WPM</strong></div>
    </div>
    <section>
      <h2>Complete clean read-through</h2>
      <div class="read-through">${cleanRead}</div>
    </section>
    <section>
      <h2>Beat details</h2>
      <div class="detail-grid">${detailCards}</div>
    </section>
    <section class="approval">
      <strong>Before approving</strong><br>
      Confirm the wording, claims, order, target duration, pronunciations, and anything that should not be spoken. No paid narration should be generated until this review is approved.
    </section>
  </main>
  <footer>Generated locally for review · ${escapeHtml(new Date().toLocaleString())}${manifest.voice ? ` · Voice: ${escapeHtml(manifest.voice)}` : ''}${manifest.model ? ` · Model: ${escapeHtml(manifest.model)}` : ''}</footer>
</body>
</html>`;

mkdirSync(outDir, { recursive: true });
const output = resolve(outDir, 'index.html');
writeFileSync(output, html);
console.log(`Spoken script review: ${output}`);
console.log(`Words: ${words} · Beats: ${manifest.beats.length} · Estimated: ${estimatedDuration} · Target: ${manifest.targetDuration}`);
