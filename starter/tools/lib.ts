// Shared helpers for the audio tools.
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

export const ROOT = resolve(import.meta.dirname, '..');
export const GEN = resolve(ROOT, 'public/gen');
export const OUT = resolve(ROOT, 'out');
mkdirSync(GEN, { recursive: true });
mkdirSync(OUT, { recursive: true });

// .env loader (no dependency)
if (existsSync(resolve(ROOT, '.env'))) {
  for (const line of readFileSync(resolve(ROOT, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

export const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
export const flag = (k: string) => process.argv.includes(`--${k}`);

export function elevenKey(): string {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) {
    console.error('ElevenLabs is not configured. Run `npm run env:setup`, stop, and follow the printed user instructions before retrying.');
    process.exit(1);
  }
  return k;
}

export async function eleven(path: string, body: unknown, accept = 'application/json'): Promise<Response> {
  const r = await fetch(`https://api.elevenlabs.io${path}`, {
    method: 'POST',
    headers: { 'xi-api-key': elevenKey(), 'content-type': 'application/json', accept },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`ElevenLabs ${path} → ${r.status}: ${(await r.text()).slice(0, 400)}`);
  return r;
}

export const hash = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 12);

export function duration(file: string): number {
  return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString());
}

/** Any audio → 48 kHz mono 24-bit WAV. */
export function toWav(src: string, dst: string, filter?: string) {
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', src, ...(filter ? ['-af', filter] : []), '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s24le', dst]);
}

export type Word = { w: string; s: number; e: number };
export type VoEntry = { dur: number; words: Word[]; hash: string; source: 'eleven' | 'scratch' };
export type VoFile = Record<string, VoEntry>;

export const readJson = <T>(f: string, d: T): T => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : d);
export const writeJson = (f: string, v: unknown) => writeFileSync(f, JSON.stringify(v, null, 2));
