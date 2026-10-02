// Scratch narration with macOS `say` — only for pacing/timing checks.
//   node tools/vo-scratch.ts [--voice Samantha] [--rate 172]
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { LINES } from '../src/script.ts';
import { GEN, arg, duration, toWav, writeJson, hash, type VoFile } from './lib.ts';

const voice = arg('voice', 'Samantha')!;
const rate = arg('rate', '172')!;
const dir = resolve(GEN, 'vo');
mkdirSync(dir, { recursive: true });
const out: VoFile = {};
for (const ln of LINES) {
  const aiff = resolve(dir, `${ln.id}.aiff`);
  const wav = resolve(dir, `${ln.id}.wav`);
  execFileSync('say', ['-v', voice, '-r', rate, '-o', aiff, ln.text.replace(/’/g, "'")]);
  toWav(aiff, wav, 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse');
  rmSync(aiff);
  const d = duration(wav);
  out[ln.id] = { dur: d, words: [], hash: hash(`scratch|${ln.text}`), source: 'scratch' };
  console.log(`${ln.id}  ${d.toFixed(2)} s`);
}
writeJson(resolve(GEN, 'vo.json'), out);
console.log(`total speech ${Object.values(out).reduce((a, b) => a + b.dur, 0).toFixed(1)} s → public/gen/vo.json`);
