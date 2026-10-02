// ElevenLabs sound effects + music bed.
//   node tools/sound.ts sfx [--only stamp,pop] [--force]
//   node tools/sound.ts music [--force] [--prompt "..."]
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GEN, OUT, arg, flag, eleven, toWav, readJson } from './lib.ts';

// Tactile, handmade sounds to match the risograph look. No techy bleeps.
export const SFX_PROMPTS: Record<string, { text: string; dur: number }> = {
  whoosh: { text: 'soft airy whoosh of a large sheet of paper sweeping past, warm and gentle, clean, very short tail', dur: 1.0 },
  pop: { text: 'single soft rounded bubble pop, playful and gentle, clean, close mic', dur: 0.5 },
  ticks: { text: 'quick cascade of tiny soft wooden taps and little pops, playful, light, dry', dur: 1.0 },
  stamp: { text: 'rubber stamp pressed firmly onto paper on a wooden desk, satisfying dry thud, close', dur: 0.6 },
  swish: { text: 'quick light swish of a paper card sliding across a table, subtle', dur: 0.5 },
  chime: { text: 'warm bright two-note marimba chime, positive and friendly, short and clean', dur: 1.2 },
  shimmer: { text: 'delicate rising glockenspiel sparkle shimmer, soft and magical but subtle', dur: 1.5 },
  pour: { text: 'a pile of paper cards and sheets tumbling onto a desk, light rustling cascade', dur: 2.0 },
};

const MUSIC_PROMPT =
  'Warm, optimistic, lightly playful instrumental bed for a friendly tech explainer video. ' +
  'Mellow Rhodes electric piano, soft plucked kalimba and nylon guitar, brushed drums, round gentle bass, analog lo-fi warmth. ' +
  'Around 96 BPM, steady and unobtrusive, leaves plenty of space for a narrator. ' +
  'A subtle lift in energy near the end, then a clean resolved ending. No vocals.';

const mode = process.argv[2];
if (mode === 'sfx') {
  const dir = resolve(GEN, 'sfx');
  mkdirSync(dir, { recursive: true });
  const only = arg('only')?.split(',');
  for (const [kind, p] of Object.entries(SFX_PROMPTS)) {
    if (only && !only.includes(kind)) continue;
    const wav = resolve(dir, `${kind}.wav`);
    if (existsSync(wav) && !flag('force')) {
      console.log(`${kind}  cached`);
      continue;
    }
    const r = await eleven('/v1/sound-generation?output_format=mp3_44100_192', { text: p.text, duration_seconds: p.dur, prompt_influence: 0.6 }, 'audio/mpeg');
    const mp3 = resolve(dir, `${kind}.mp3`);
    writeFileSync(mp3, Buffer.from(await r.arrayBuffer()));
    toWav(mp3, wav, 'silenceremove=start_periods=1:start_threshold=-45dB');
    console.log(`${kind}  ok`);
  }
} else if (mode === 'music') {
  const wav = resolve(GEN, 'music.wav');
  if (existsSync(wav) && !flag('force')) {
    console.log('music cached (use --force to regenerate)');
    process.exit(0);
  }
  const sched = readJson<{ total: number } | null>(resolve(OUT, 'schedule.json'), null);
  const secs = Math.ceil((sched?.total ?? 150) + 3);
  const r = await eleven('/v1/music?output_format=mp3_44100_192', {
    prompt: arg('prompt', MUSIC_PROMPT),
    music_length_ms: Math.min(secs, 300) * 1000,
    model_id: 'music_v1',
    force_instrumental: true,
  }, 'audio/mpeg');
  const mp3 = resolve(GEN, 'music.mp3');
  writeFileSync(mp3, Buffer.from(await r.arrayBuffer()));
  // keep stereo for music
  const { execFileSync } = await import('node:child_process');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', mp3, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s24le', wav]);
  console.log(`music ${secs}s → public/gen/music.wav`);
} else {
  console.log('usage: node tools/sound.ts sfx|music');
}
