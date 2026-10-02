// Audition voices: reads the same two lines with several voices so you can pick one.
//   node tools/voices.ts                 → narration-style voices in your library (up to 8)
//   node tools/voices.ts --ids id1,id2   → specific voices
// Output: public/gen/voices/<name>.mp3  (then set ELEVEN_VOICE_ID in .env)
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LINES } from '../src/script.ts';
import { GEN, arg, eleven, elevenKey } from './lib.ts';

const MODEL = process.env.ELEVEN_MODEL ?? 'eleven_multilingual_v2';
// Use the opener plus a representative middle line; story IDs vary by project.
const middle = LINES[Math.min(LINES.length - 1, Math.floor(LINES.length / 2))];
const sample = [LINES[0].text, middle.text].join(' ');
const dir = resolve(GEN, 'voices');
mkdirSync(dir, { recursive: true });

type V = { voice_id: string; name: string; labels?: Record<string, string>; category?: string };
const all = ((await (await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': elevenKey() } })).json()) as { voices: V[] }).voices;
const ids = arg('ids')?.split(',');
let pick = ids ? all.filter((v) => ids.includes(v.voice_id)) : all.filter((v) => /narrat|educat|informative|documentary|conversational/i.test(JSON.stringify(v.labels ?? {})));
if (!ids && pick.length < 4) pick = all;
pick = pick.slice(0, parseInt(arg('n', '8')!, 10));

for (const v of pick) {
  let r: Response;
  try {
    r = await eleven(`/v1/text-to-speech/${v.voice_id}?output_format=mp3_44100_128`, {
    text: sample,
    model_id: MODEL,
    voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
  }, 'audio/mpeg');
  } catch (e) {
    console.log(`${v.name.padEnd(24)} FAILED  ${String((e as Error).message).slice(0, 160)}`);
    continue;
  }
  const f = resolve(dir, `${v.name.replace(/[^\w-]+/g, '_')}.mp3`);
  writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  console.log(`${v.name.padEnd(24)} ${v.voice_id}  ${JSON.stringify(v.labels ?? {})}`);
}
console.log(`\nlisten: ${dir}`);
