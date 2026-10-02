// ElevenLabs narration, one request per line (with neighbouring text for
// natural prosody). Caches by text + voice + settings, so only changed lines
// are regenerated.
//   node tools/vo.ts [--only 2.4,4.2] [--force]
import { mkdirSync, writeFileSync, existsSync, copyFileSync, rmSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { LINES, TTS } from '../src/script.ts';
import { GEN, arg, flag, eleven, hash, duration, toWav, readJson, writeJson, type VoFile, type Word } from './lib.ts';

const VOICE = process.env.ELEVEN_VOICE_ID;
if (!VOICE) {
  console.error('Set ELEVEN_VOICE_ID in .env (run `npm run voices` to audition options).');
  process.exit(1);
}
const MODEL = process.env.ELEVEN_MODEL ?? 'eleven_multilingual_v2';
const FORMAT = process.env.ELEVEN_FORMAT ?? 'mp3_44100_192';
/** Playback speed applied after generation (pitch preserved). 1.075 = 7.5% faster. */
const MAX_GAP = 0.6;
const KEEP_AFTER = 0.14;
const KEEP_BEFORE = 0.45;
const XFADE = 0.02;

/** Remove `cuts` with short crossfades, then fade both ends so clips never click. */
function polish(wav: string, cuts: [number, number][]) {
  const tmp = wav.replace(/\.wav$/, '.polish.wav');
  const keep: [number, number | null][] = [];
  let t = 0;
  for (const [a, b] of cuts) {
    keep.push([t, a + XFADE / 2]);
    t = b - XFADE / 2;
  }
  keep.push([t, null]);
  const parts = keep.map(([a, b], i) => `[0:a]atrim=start=${a.toFixed(3)}${b != null ? `:end=${b.toFixed(3)}` : ''},asetpts=PTS-STARTPTS[p${i}]`);
  let last = 'p0';
  for (let i = 1; i < keep.length; i++) {
    parts.push(`[${last}][p${i}]acrossfade=d=${XFADE}:c1=qsin:c2=qsin[x${i}]`);
    last = `x${i}`;
  }
  parts.push(`[${last}]afade=t=in:d=0.006,areverse,afade=t=in:d=0.04,areverse,apad=pad_dur=0.12[out]`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', wav, '-filter_complex', parts.join(';'), '-map', '[out]', '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s24le', tmp]);
  renameSync(tmp, wav);
}
const TEMPO = parseFloat(process.env.VO_TEMPO ?? arg('tempo', '1.075')!);
const SETTINGS = {
  stability: parseFloat(process.env.ELEVEN_STABILITY ?? '0.5'),
  similarity_boost: parseFloat(process.env.ELEVEN_SIMILARITY ?? '0.8'),
  style: parseFloat(process.env.ELEVEN_STYLE ?? '0.15'),
  use_speaker_boost: true,
  speed: parseFloat(process.env.ELEVEN_SPEED ?? '1.0'),
};

if (MODEL.startsWith('eleven_v3')) {
  SETTINGS.stability = [0, 0.5, 1].reduce((p, c) => (Math.abs(c - SETTINGS.stability) < Math.abs(p - SETTINGS.stability) ? c : p));
}
const only = arg('only')?.split(',');
const dir = resolve(GEN, 'vo');
mkdirSync(dir, { recursive: true });
const voPath = resolve(GEN, 'vo.json');
const vo: VoFile = readJson(voPath, {});

type Alignment = { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };

function words(al: Alignment): Word[] {
  const out: Word[] = [];
  let cur: Word | null = null;
  let inTag = false;
  al.characters.forEach((ch, i) => {
    if (ch === '[') inTag = true;
    if (inTag) {
      if (ch === ']') inTag = false;
      return;
    }
    if (/\s/.test(ch)) {
      if (cur) out.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { w: '', s: al.character_start_times_seconds[i], e: 0 };
    cur.w += ch;
    cur.e = al.character_end_times_seconds[i];
  });
  if (cur) out.push(cur);
  return out.filter((w) => /[\p{L}\p{N}]/u.test(w.w));
}

for (let k = 0; k < LINES.length; k++) {
  const ln = LINES[k];
  if (only && !only.includes(ln.id)) continue;
  const spokenText = TTS[ln.id] ?? ln.text;
  const key = hash(JSON.stringify([spokenText, VOICE, MODEL, SETTINGS]));
  const wav = resolve(dir, `${ln.id}.wav`);
  const mp3 = resolve(dir, `${ln.id}.mp3`);
  const rawPath = resolve(dir, `${ln.id}.raw.json`);
  const take = resolve(dir, `${ln.id}.take.wav`);
  let raw = readJson<{ hash: string; words: Word[] } | null>(rawPath, null);
  // keep previously approved takes: adopt the existing wav as the raw take
  if (!raw && vo[ln.id]?.hash === key && existsSync(wav)) {
    copyFileSync(wav, take);
    raw = { hash: key, words: vo[ln.id].words };
    writeJson(rawPath, raw);
  }
  if (flag('force') || !raw || raw.hash !== key || (!existsSync(take) && !existsSync(mp3))) {
    const body: Record<string, unknown> = { text: spokenText, model_id: MODEL, voice_settings: SETTINGS };
    if (!MODEL.startsWith('eleven_v3')) {
      body.previous_text = LINES.slice(Math.max(0, k - 2), k).map((l) => l.text).join(' ') || undefined;
      body.next_text = LINES[k + 1]?.text;
    }
    const r = await eleven(`/v1/text-to-speech/${VOICE}/with-timestamps?output_format=${FORMAT}`, body);
    const j = (await r.json()) as { audio_base64: string; alignment: Alignment | null; normalized_alignment?: Alignment | null };
    writeFileSync(mp3, Buffer.from(j.audio_base64, 'base64'));
    rmSync(take, { force: true });
    const al = j.alignment ?? j.normalized_alignment;
    raw = { hash: key, words: al ? words(al) : [] };
    writeJson(rawPath, raw);
    console.log(`${ln.id}  generated`);
  }
  // derive the working take: trim to the first word, then apply tempo (pitch preserved)
  const ws = raw.words.map((w) => ({ ...w }));
  const clean = ln.text.split(/\s+/).filter(Boolean);
  if (ws.length === clean.length) ws.forEach((w, i) => (w.w = clean[i]));
  else console.log(`  (word count differs: spoken ${ws.length} vs text ${clean.length}; captions use spoken words)`);
  const lead = Math.max(0, (ws[0]?.s ?? 0) - 0.03);
  const af = [lead > 0.01 ? `atrim=start=${lead.toFixed(3)},asetpts=PTS-STARTPTS` : '', TEMPO !== 1 ? `atempo=${TEMPO}` : ''].filter(Boolean).join(',');
  toWav(existsSync(take) ? take : mp3, wav, af || undefined);
  for (const w of ws) {
    w.s = +((w.s - lead) / TEMPO).toFixed(3);
    w.e = +((w.e - lead) / TEMPO).toFixed(3);
  }
  // cap long pauses inside a line (v3 sometimes leaves dead air after a tag).
  // Keep generous pre-roll before the next word (consonant attacks start early) and crossfade the join.
  const cuts: [number, number][] = [];
  for (let i = 0; i < ws.length - 1; i++) {
    const a = ws[i].e + KEEP_AFTER;
    const b = ws[i + 1].s - KEEP_BEFORE;
    if (b - a > 0.08 && ws[i + 1].s - ws[i].e > MAX_GAP) cuts.push([a, b]);
  }
  polish(wav, cuts);
  for (const w of ws) {
    const shift = cuts.filter(([, b]) => b <= w.s).reduce((p, [a, b]) => p + (b - a) + XFADE, 0);
    w.s = +(w.s - shift).toFixed(3);
    w.e = +(w.e - shift).toFixed(3);
  }
  if (cuts.length) console.log(`  trimmed ${cuts.length} long pause(s)`);
  const spoken = ws.length ? ws[ws.length - 1].e + 0.12 : duration(wav);
  vo[ln.id] = { dur: +Math.min(duration(wav), spoken).toFixed(3), words: ws, hash: `${key}@${TEMPO}`, source: 'eleven' };
  writeJson(voPath, vo);
  console.log(`${ln.id}  ${vo[ln.id].dur.toFixed(2)} s  (${ws.length} words)`);
}
const total = LINES.reduce((a, l) => a + (vo[l.id]?.dur ?? 0), 0);
console.log(`total speech ${total.toFixed(1)} s → public/gen/vo.json`);
