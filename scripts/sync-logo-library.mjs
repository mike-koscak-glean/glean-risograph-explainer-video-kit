import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INVENTORY = resolve(ROOT, 'references/app-logo-assets.csv');
const ACTIVE_DIR = resolve(ROOT, 'starter/public/logos');
const LIBRARY_DIR = resolve(ACTIVE_DIR, 'library');
const CATALOG_PATH = resolve(LIBRARY_DIR, 'catalog.json');
const GALLERY_PATH = resolve(LIBRARY_DIR, 'index.html');
const UNAVAILABLE_PATH = resolve(ROOT, 'references/logo-library-unavailable.json');
const TYPESCRIPT_PATH = resolve(ROOT, 'starter/src/logo-library.ts');
const CHECK = process.argv.includes('--check');
const FORCE = process.argv.includes('--force');
const PRUNE = process.argv.includes('--prune');
const MAX_BYTES = 2 * 1024 * 1024;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows;
}

function loadInventory() {
  if (!existsSync(INVENTORY)) throw new Error(`Missing logo inventory: ${INVENTORY}`);
  const [header, ...data] = parseCsv(readFileSync(INVENTORY, 'utf8'));
  const expected = ['url', 'filename', 'ext', 'found_in'];
  if (header.join('|') !== expected.join('|')) throw new Error(`Unexpected inventory columns: ${header.join(', ')}`);
  return data.filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(expected.map((key, i) => [key, row[i] ?? ''])));
}

function canonicalLogoRows(rows) {
  const candidates = [];
  for (const row of rows) {
    let url;
    try {
      url = new URL(row.url);
    } catch {
      continue;
    }
    if (url.protocol !== 'https:' || url.hostname !== 'app.glean.com' || !url.pathname.startsWith('/images/logos/')) continue;
    if (url.search || url.hash || url.username || url.password) throw new Error(`Unsafe canonical logo URL: ${row.url}`);
    if (basename(url.pathname) !== row.filename) throw new Error(`Filename does not match URL: ${row.url}`);
    if (!/^[A-Za-z0-9._-]+$/.test(row.filename)) throw new Error(`Unsafe logo filename: ${row.filename}`);
    if (!['svg', 'png', 'jpeg', 'jpg'].includes(row.ext.toLowerCase())) throw new Error(`Unsupported logo extension: ${row.filename}`);
    candidates.push(row);
  }

  // Keep differently named variants, but prefer SVG when one stem has both SVG and raster copies.
  const preferred = new Map();
  for (const row of candidates) {
    const stem = row.filename.slice(0, -extname(row.filename).length).toLowerCase();
    const previous = preferred.get(stem);
    if (!previous || (row.ext.toLowerCase() === 'svg' && previous.ext.toLowerCase() !== 'svg')) preferred.set(stem, row);
  }
  return [...preferred.values()].sort((a, b) => a.filename.localeCompare(b.filename, undefined, { sensitivity: 'base' }));
}

function decodeTransport(bytes) {
  return bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes) : bytes;
}

function validateAsset(filename, input) {
  const bytes = decodeTransport(input);
  if (!bytes.length || bytes.length > MAX_BYTES) throw new Error(`Invalid asset size for ${filename}: ${bytes.length}`);
  const ext = extname(filename).toLowerCase();
  if (ext === '.svg') {
    const text = bytes.toString('utf8');
    if (!/<svg\b/i.test(text)) throw new Error(`Missing SVG root in ${filename}`);
    const unsafe = /<script\b|<foreignObject\b|<!ENTITY|\bon[a-z]+\s*=|javascript:|(?:href|xlink:href)\s*=\s*["']https?:|url\(\s*https?:/i;
    if (unsafe.test(text)) throw new Error(`Unsafe active or remote content in ${filename}`);
    const normalized = `${text.replace(/\r\n?/g, '\n').split('\n').map((line) => line.replace(/[ \t]+$/g, '')).join('\n').trimEnd()}\n`;
    return Buffer.from(normalized);
  } else if (ext === '.png') {
    const magic = bytes.subarray(0, 8).toString('hex');
    if (magic !== '89504e470d0a1a0a') throw new Error(`Invalid PNG payload: ${filename}`);
  } else if (ext === '.jpg' || ext === '.jpeg') {
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes.at(-2) !== 0xff || bytes.at(-1) !== 0xd9) {
      throw new Error(`Invalid JPEG payload: ${filename}`);
    }
  }
  return bytes;
}

async function download(row, target) {
  const response = await fetch(row.url, { redirect: 'follow', headers: { 'user-agent': 'glean-risograph-logo-sync/1.0' } });
  if (!response.ok) throw new Error(`${row.filename}: HTTP ${response.status}`);
  const contentLength = Number(response.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BYTES) throw new Error(`${row.filename}: content-length ${contentLength} exceeds limit`);
  const bytes = validateAsset(row.filename, Buffer.from(await response.arrayBuffer()));
  const temporary = `${target}.tmp`;
  writeFileSync(temporary, bytes);
  renameSync(temporary, target);
  return bytes;
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

function keyFor(filename) {
  return filename.slice(0, -extname(filename).length).toLowerCase();
}

function writeOutputs(entries) {
  const catalog = entries.map(({ row, webPath, bytes }) => ({
    key: keyFor(row.filename),
    filename: row.filename,
    path: webPath,
    location: webPath.startsWith('/logos/library/') ? 'on-demand library' : 'active set',
    sourceUrl: row.url,
    foundIn: row.found_in,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  }));
  writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);

  const gallery = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>App logo library</title>
  <style>
    :root { --paper:#f3eedf; --ink:#17204f; --coral:#f06449; --lime:#c8dc38; --cyan:#0a9bc2; --muted:#5d6477; }
    * { box-sizing:border-box; }
    body { margin:0; color:var(--ink); background:var(--paper); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    header { position:sticky; top:0; z-index:2; padding:28px clamp(20px,4vw,56px); border-bottom:2px solid var(--ink); background:rgba(243,238,223,.96); backdrop-filter:blur(12px); }
    .eyebrow { color:var(--cyan); font:700 12px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.16em; text-transform:uppercase; }
    h1 { margin:8px 0 14px; font-size:clamp(32px,5vw,62px); line-height:1; letter-spacing:-.045em; text-shadow:3px 3px 0 rgba(240,100,73,.5); }
    header p { margin:0 0 18px; color:var(--muted); }
    input { width:min(680px,100%); padding:13px 15px; border:2px solid var(--ink); background:#fff; color:var(--ink); font:16px/1.2 inherit; box-shadow:5px 5px 0 var(--lime); }
    main { width:min(1500px,94vw); margin:0 auto; padding:34px 0 70px; }
    #count { margin-bottom:20px; color:var(--muted); font-weight:700; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:18px; }
    .card { min-width:0; border:2px solid var(--ink); background:rgba(255,255,255,.62); box-shadow:5px 5px 0 var(--lime); }
    .image { display:grid; place-items:center; height:150px; padding:22px; border-bottom:2px solid var(--ink); background:#fff; }
    img { max-width:100%; max-height:100%; object-fit:contain; }
    .copy { padding:14px; }
    h2 { margin:0 0 7px; overflow-wrap:anywhere; font-size:17px; }
    code { display:block; overflow:hidden; color:var(--cyan); font-size:12px; text-overflow:ellipsis; white-space:nowrap; }
    .meta { margin-top:10px; color:var(--muted); font-size:11px; line-height:1.35; }
    a { color:inherit; }
  </style>
</head>
<body>
  <header>
    <div class="eyebrow">On-demand local assets</div>
    <h1>App logo library</h1>
    <p>Search by key, filename, or source. These assets are not preloaded by the video engine.</p>
    <input id="search" type="search" placeholder="Search logos…" autocomplete="off">
  </header>
  <main>
    <div id="count">Loading…</div>
    <div id="grid" class="grid"></div>
  </main>
  <script>
    const grid = document.querySelector('#grid');
    const count = document.querySelector('#count');
    const search = document.querySelector('#search');
    let items = [];
    function render() {
      const query = search.value.trim().toLowerCase();
      const shown = items.filter(item => [item.key,item.filename,item.foundIn,item.location].join(' ').toLowerCase().includes(query));
      count.textContent = shown.length + ' of ' + items.length + ' logos';
      grid.replaceChildren(...shown.map(item => {
        const card = document.createElement('article');
        card.className = 'card';
        const image = document.createElement('div'); image.className = 'image';
        const img = document.createElement('img'); img.src = item.path; img.alt = item.key + ' logo'; img.loading = 'lazy'; image.append(img);
        const copy = document.createElement('div'); copy.className = 'copy';
        const title = document.createElement('h2'); title.textContent = item.key;
        const path = document.createElement('code'); path.textContent = item.path; path.title = item.path;
        const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = item.filename + ' · ' + item.location + ' · ' + item.foundIn;
        const link = document.createElement('a'); link.href = item.sourceUrl; link.target = '_blank'; link.rel = 'noreferrer'; link.textContent = 'Source';
        copy.append(title,path,meta,link); card.append(image,copy); return card;
      }));
    }
    fetch('./catalog.json').then(response => response.json()).then(data => { items = data; render(); });
    search.addEventListener('input', render);
  </script>
</body>
</html>`;
  writeFileSync(GALLERY_PATH, gallery);

  const lines = [
    '// Generated by scripts/sync-logo-library.mjs from references/app-logo-assets.csv.',
    '// These paths are available on demand; they are not preloaded by src/logos.ts.',
    'export const APP_LOGO_PATHS = {',
    ...catalog.map((item) => `  ${JSON.stringify(item.key)}: ${JSON.stringify(item.path)},`),
    '} as const;',
    '',
    'export type AppLogoKey = keyof typeof APP_LOGO_PATHS;',
    '',
    'export function appLogoPath(key: AppLogoKey): string {',
    '  return APP_LOGO_PATHS[key];',
    '}',
    '',
  ];
  writeFileSync(TYPESCRIPT_PATH, lines.join('\n'));
}

mkdirSync(LIBRARY_DIR, { recursive: true });
const rows = canonicalLogoRows(loadInventory());
const knownUnavailable = existsSync(UNAVAILABLE_PATH)
  ? new Map(JSON.parse(readFileSync(UNAVAILABLE_PATH, 'utf8')).map((item) => [item.filename, item]))
  : new Map();
let downloaded = 0;
let active = 0;

const results = await mapLimit(rows, 8, async (row) => {
  const activePath = resolve(ACTIVE_DIR, row.filename);
  const libraryPath = resolve(LIBRARY_DIR, row.filename);
  let diskPath;
  let webPath;
  if (existsSync(activePath)) {
    diskPath = activePath;
    webPath = `/logos/${row.filename}`;
    active++;
  } else {
    diskPath = libraryPath;
    webPath = `/logos/library/${row.filename}`;
    if (!existsSync(diskPath) || FORCE) {
      if (CHECK) {
        const known = knownUnavailable.get(row.filename);
        if (known?.sourceUrl === row.url) return { row, error: known.error };
        throw new Error(`Missing local logo: ${row.filename}`);
      }
      try {
        await download(row, diskPath);
        downloaded++;
        if (downloaded % 25 === 0) console.log(`Downloaded ${downloaded} assets…`);
      } catch (error) {
        return { row, error: error instanceof Error ? error.message : String(error) };
      }
    }
  }
  const raw = readFileSync(diskPath);
  const validated = validateAsset(row.filename, raw);
  const isLibraryAsset = webPath.startsWith('/logos/library/');
  if (isLibraryAsset && !raw.equals(validated)) writeFileSync(diskPath, validated);
  const bytes = isLibraryAsset ? validated : raw;
  return { row, webPath, bytes };
});

const entries = results.filter((result) => result.bytes);
const unavailable = results.filter((result) => result.error).map(({ row, error }) => ({
  filename: row.filename,
  sourceUrl: row.url,
  foundIn: row.found_in,
  error,
}));

if (PRUNE) {
  const keep = new Set(entries.filter((entry) => entry.webPath.startsWith('/logos/library/')).map((entry) => entry.row.filename));
  for (const filename of readdirSync(LIBRARY_DIR)) {
    if (filename === 'catalog.json' || filename === 'index.html') continue;
    if (!keep.has(filename)) rmSync(resolve(LIBRARY_DIR, filename));
  }
}

writeOutputs(entries);
writeFileSync(UNAVAILABLE_PATH, `${JSON.stringify(unavailable, null, 2)}\n`);
console.log(`Logo inventory rows: ${loadInventory().length}`);
console.log(`Preferred app-logo assets: ${rows.length}`);
console.log(`Available local app-logo assets: ${entries.length}`);
console.log(`Existing active logos reused: ${active}`);
console.log(`Library assets downloaded: ${downloaded}`);
console.log(`Unavailable or rejected assets: ${unavailable.length}`);
for (const item of unavailable) console.log(`  - ${item.filename}: ${item.error}`);
console.log(`Catalog: ${CATALOG_PATH}`);
console.log(`Searchable gallery: ${GALLERY_PATH}`);
console.log(`Unavailable report: ${UNAVAILABLE_PATH}`);
console.log(`TypeScript paths: ${TYPESCRIPT_PATH}`);
