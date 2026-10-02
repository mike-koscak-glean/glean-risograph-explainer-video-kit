# Risograph Editorial Explainer Video Starter

A working, sanitized ExampleCo sample built with the Glean Risograph Editorial Explainer Video Kit. The project generator copies this engine into each new video.

Do not edit the shared starter for one-off content. Generate an independent project from the kit root. Each generated project contains:

- Flexible general, customer-specific, or undecided intake
- `project/intake-notes.md` for freeform context
- `project/research-notes.md` for Glean and supplied-source research
- `project/STATUS.md` plus all gated phase artifacts
- All four Glean Tau skills, references, and its own source tree

## Production commands

```bash
npm install
cp .env.example .env
npm run voices
npm run build
npm run vo
npm run schedule
npm run sfx
npm run music
npm run render:draft
npm run render
npm run mix
```

The default final output is `out/risograph-explainer-video.mp4` with captions in `out/captions.srt`.

## Main source areas

- `src/story.ts` — on-screen copy and story data.
- `src/script.ts` — narration.
- `src/scenes/` — visual implementation.
- `src/ink.ts` — risograph editorial design system.
- `tools/` — voice, sound, rendering, mixing, and captions.
- `public/logos/` — local approved logo assets.

The ExampleCo customer, people, account, use cases, and measurements are illustrative. Replace them through the gated workflow and revalidate every claim.
