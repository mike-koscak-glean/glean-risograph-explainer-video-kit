# ElevenLabs and Audio Workflow

## Configuration

ElevenLabs is required only for voice auditions, final narration, generated sound effects, and generated music. Story shaping, storyboards, style frames, and local scratch narration work without it.

Create an API key in the ElevenLabs account settings. Never paste the key into Tau or another message. Ask Tau to copy `.env.example` to `.env`, then enter the secret yourself in the local file.

`.env` lives at the generated project root beside `package.json`. It is hidden on macOS because its name begins with a period. Press **Command + Shift + .** in Finder to show hidden files, or run:

```bash
cp .env.example .env
open -e .env
```

Configure:

```text
ELEVENLABS_API_KEY=paste_your_key_here
ELEVEN_VOICE_ID=
ELEVEN_MODEL=eleven_v3
ELEVEN_STABILITY=0.5
ELEVEN_STYLE=0.15
ELEVEN_SPEED=1.0
VO_TEMPO=1.075
```

Save the file locally. `.env` is ignored by Git. The key and selected voice ID are required for production. Model availability and parameters can change; verify them in the current ElevenLabs account.

## Voice selection

The reference videos used Eric with ElevenLabs v3 and restrained delivery cues. Do not hardcode one voice for every audience. Test a short paragraph that includes customer names, acronyms, and the intended emotional range.

Run:

```bash
npm run voices
npm run vo:scratch -- --text "Your test line"
```

Record the selected voice and pronunciations in `project/brief.md`.

## Production sequence

1. Approve the clean spoken script.
2. Add sparse delivery cues to the ElevenLabs script map.
3. Run `npm run vo`; unchanged lines are cached.
4. Review duration, onset, ending, and unusual pauses for every line.
5. Build the visual schedule from measured audio durations.
6. Generate sound effects only after visual beats are stable.
7. Generate music after `out/schedule.json` exists so its duration matches the video.
8. Run `npm run mix` to place narration, duck music, add effects, normalize loudness, and create captions.

## Sound language

The reference sound palette is tactile and handmade: paper whooshes, soft pops, wooden ticks, rubber stamps, gentle chimes, and restrained shimmer. Avoid sci-fi beeps unless the story explicitly needs them.

## Mix targets

- Narration remains dominant and intelligible.
- Music stays unobtrusive under speech and lifts only when the story allows.
- The default final target is approximately −14 LUFS.
- Inspect the start of every narration line for clipped consonants or clicks.
- Compare the final mix transcript with the approved script.

## Cost control

- Use scratch generation before committing to a voice.
- Cache narration by line.
- Regenerate only changed lines.
- Use draft renders and contact sheets before final music or 4K output.
- Keep generated audio out of Git.
