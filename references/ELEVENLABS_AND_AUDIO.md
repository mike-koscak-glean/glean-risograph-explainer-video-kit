# ElevenLabs and Audio Workflow

## Configuration

ElevenLabs is required only for voice auditions, final narration, generated sound effects, and generated music. Story shaping, storyboards, style frames, local scratch narration, and the visible script review work without it.

After the displayed script is approved, Tau must run:

```bash
npm run env:setup
```

The command is dependency-free and safe to run before `npm install`. It:

- Creates `.env` automatically.
- Copies `.env.example` when available.
- Uses a built-in safe template when `.env.example` is missing.
- Preserves existing values and adds missing configuration names.
- Reports only whether the key and voice ID are configured.
- Never prints secret values.

If the API key is missing, Tau must stop and give the user the exact absolute `.env` path printed by the command. The user opens that hidden local file, enters the value after `ELEVENLABS_API_KEY=`, saves, and confirms only that the key was saved. Never ask the user to paste the key into chat.

After confirmation, run:

```bash
npm run env:check
```

Do not run an ElevenLabs command unless this check passes. `.env` is ignored by Git and must remain local. Model availability and parameters can change by account plan.

## Voice selection

The reference videos used Eric with ElevenLabs v3 and restrained delivery cues. Do not hardcode one voice for every audience. Test a short paragraph that includes customer names, acronyms, and the intended emotional range.

After the key check passes, run:

```bash
npm run voices -- --n 3
npm run vo:scratch
```

After the user chooses a voice, save and validate the non-secret ID without displaying the API key:

```bash
npm run env:setup -- --set-voice the_selected_voice_id
npm run env:check -- --require-voice
```

Record the selected voice and pronunciations in `project/brief.md`.

## Production sequence

1. Display and approve the complete clean spoken script in Tau’s visible Browser sidebar.
2. Run `npm run env:setup`, stop for local user input if required, and pass `npm run env:check`.
3. Audition, select, save, and check a voice ID.
4. Add sparse delivery cues to the ElevenLabs script map.
5. Run `npm run vo`; unchanged lines are cached.
6. Review duration, onset, ending, and unusual pauses for every line.
7. Build the visual schedule from measured audio durations.
8. Generate sound effects only after visual beats are stable.
9. Generate music after `out/schedule.json` exists so its duration matches the video.
10. Run `npm run mix` to place narration, duck music, add effects, normalize loudness, and create captions.

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
