// Mix narration + SFX + music against the render schedule, normalise loudness,
// write captions, and (if a video exists) mux the final MP4.
//   node tools/mix.ts [--video out/video.mp4] [--out out/risograph-explainer-video.mp4]
//                     [--music-db -17] [--sfx-db -9] [--lufs -14] [--no-music] [--no-sfx]
import { existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { GEN, OUT, arg, flag, readJson, type VoFile, type Word } from './lib.ts';

type Slot = { id: string; text: string; start: number; end: number; voStart: number; voDur: number };
type Schedule = { slots: Slot[]; sfx: { at: number; kind: string; gain: number }[]; total: number; estimated: boolean };

const sched = readJson<Schedule | null>(resolve(OUT, 'schedule.json'), null);
if (!sched) {
  console.error('out/schedule.json missing — run a render (or `npm run schedule`) first.');
  process.exit(1);
}
const vo = readJson<VoFile>(resolve(GEN, 'vo.json'), {});
const T = sched.total;
const MUSIC_DB = parseFloat(arg('music-db', '-17')!);
const SFX_DB = parseFloat(arg('sfx-db', '-9')!);
const LUFS = parseFloat(arg('lufs', '-14')!);
const db = (d: number) => Math.pow(10, d / 20);

const inputs: string[] = [];
const filters: string[] = [];
const add = (f: string) => {
  inputs.push('-i', f);
  return inputs.length / 2 - 1;
};

// base silence so the mix is exactly T long
filters.push(`anullsrc=r=48000:cl=stereo,atrim=0:${T.toFixed(3)}[base]`);

// ── narration ──
const voLabels: string[] = [];
for (const s of sched.slots) {
  const f = resolve(GEN, 'vo', `${s.id}.wav`);
  if (!s.text || !existsSync(f)) continue;
  const i = add(f);
  const ms = Math.round(s.voStart * 1000);
  filters.push(`[${i}:a]aformat=sample_rates=48000:channel_layouts=mono,adelay=${ms}:all=1[v${i}]`);
  voLabels.push(`[v${i}]`);
}
if (!voLabels.length) {
  console.error('No narration files in public/gen/vo — run `npm run vo` (or `npm run vo:scratch`).');
  process.exit(1);
}
filters.push(
  `${voLabels.join('')}amix=inputs=${voLabels.length}:normalize=0:dropout_transition=0,` +
    `highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=6:release=140:makeup=1.5,` +
    `aformat=channel_layouts=stereo,apad,atrim=0:${T.toFixed(3)},asplit=2[vo][vosc]`,
);

// ── sfx ──
const sfxLabels: string[] = [];
if (!flag('no-sfx')) {
  const missing = new Set<string>();
  sched.sfx.forEach((e, k) => {
    const f = resolve(GEN, 'sfx', `${e.kind}.wav`);
    if (!existsSync(f)) return void missing.add(e.kind);
    const i = add(f);
    filters.push(`[${i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${(db(SFX_DB) * e.gain).toFixed(4)},adelay=${Math.round(e.at * 1000)}:all=1[s${k}]`);
    sfxLabels.push(`[s${k}]`);
  });
  if (missing.size) console.log(`(skipping sfx without files: ${[...missing].join(', ')})`);
}
if (sfxLabels.length) filters.push(`${sfxLabels.join('')}amix=inputs=${sfxLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${T.toFixed(3)}[sfx]`);

// ── music, ducked under the voice ──
const musicFile = resolve(GEN, 'music.wav');
const hasMusic = !flag('no-music') && existsSync(musicFile);
if (hasMusic) {
  const i = add(musicFile);
  filters.push(
    `[${i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${db(MUSIC_DB).toFixed(4)},apad,atrim=0:${T.toFixed(3)},` +
      `afade=t=in:st=0:d=1.2,afade=t=out:st=${(T - 3.5).toFixed(3)}:d=3.5[mraw]`,
    `[mraw][vosc]sidechaincompress=threshold=0.015:ratio=5:attack=90:release=900:makeup=1[mus]`,
  );
} else console.log('(no music bed — run `npm run music` to add one)');

const buses = ['[base]', '[vo]', ...(sfxLabels.length ? ['[sfx]'] : []), ...(hasMusic ? ['[mus]'] : [])];
if (!hasMusic) filters.push('[vosc]anullsink');
filters.push(`${buses.join('')}amix=inputs=${buses.length}:normalize=0:dropout_transition=0,alimiter=limit=0.9:level=disabled[pre]`);

const pre = resolve(OUT, 'mix-pre.wav');
execFileSync('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', filters.join(';'), '-map', '[pre]', '-ar', '48000', '-c:a', 'pcm_s24le', pre], { maxBuffer: 1 << 26 });

// ── two-pass loudness normalisation ──
const m = JSON.parse(
  execFileSync('sh', ['-c', `ffmpeg -hide_banner -i "${pre}" -af loudnorm=I=${LUFS}:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p'`], { encoding: 'utf8' }),
);
const mix = resolve(GEN, 'mix.wav');
execFileSync('ffmpeg', [
  '-y', '-v', 'error', '-i', pre,
  '-af', `loudnorm=I=${LUFS}:TP=-1.0:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
  '-ar', '48000', '-c:a', 'pcm_s24le', mix,
]);
console.log(`mix ${T.toFixed(1)} s · ${voLabels.length} lines · ${sfxLabels.length} sfx · music ${hasMusic ? 'yes' : 'no'} · ${m.input_i} → ${LUFS} LUFS → public/gen/mix.wav`);

// ── captions (SRT) ──
function lineWords(s: Slot): Word[] {
  const e = vo[s.id];
  if (e?.words?.length) return e.words;
  // scratch VO: spread words over the duration by length
  const ws = s.text.split(/\s+/).filter(Boolean);
  const totalC = ws.reduce((a, w) => a + w.length + 1, 0);
  let t = 0;
  const d = e?.dur ?? s.voDur;
  return ws.map((w) => {
    const len = ((w.length + 1) / totalC) * d;
    const out = { w, s: t, e: t + len };
    t += len;
    return out;
  });
}
const cues: { s: number; e: number; text: string }[] = [];
for (const s of sched.slots) {
  if (!s.text) continue;
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    cues.push({ s: s.voStart + cur[0].s, e: s.voStart + cur[cur.length - 1].e, text: cur.map((w) => w.w).join(' ') });
    cur = [];
  };
  for (const w of lineWords(s)) {
    const len = [...cur, w].map((x) => x.w).join(' ').length;
    if (cur.length && len > 42) flush();
    cur.push(w);
    if (/[.,:;?!]$/.test(w.w) && cur.map((x) => x.w).join(' ').length > 18) flush();
  }
  flush();
}
cues.forEach((c, i) => {
  const next = cues[i + 1];
  c.e = Math.max(c.e + 0.25, c.s + 1.0);
  if (next && c.e > next.s - 0.05) c.e = next.s - 0.05;
});
const ts = (t: number) => {
  const ms = Math.round(t * 1000);
  const h = Math.floor(ms / 3600000);
  const mi = Math.floor((ms % 3600000) / 60000);
  const se = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${String(se).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
};
writeFileSync(resolve(OUT, 'captions.srt'), cues.map((c, i) => `${i + 1}\n${ts(c.s)} --> ${ts(c.e)}\n${c.text}\n`).join('\n'));
console.log(`captions ${cues.length} cues → out/captions.srt`);

// ── mux ──
const video = resolve(arg('video', resolve(OUT, 'video.mp4'))!);
if (existsSync(video)) {
  const final = resolve(arg('out', resolve(OUT, 'risograph-explainer-video.mp4'))!);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', video, '-i', mix, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', '-shortest', final]);
  console.log(`final → ${final}`);
} else console.log(`(no video at ${video} — render first to mux)`);
