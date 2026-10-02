# Engine Guide

## Core files

- `src/ink.ts` — palette, typography, halftone, texture, cards, stamps, people, and logo drawing.
- `src/motion.ts` — easing, timing segments, deterministic noise, and hand-drawn boil.
- `src/story.ts` — on-screen copy and reusable story data.
- `src/script.ts` — clean narration plus ElevenLabs delivery text.
- `src/sfx.ts` — per-line sound-effect cues.
- `src/scenes/` — visual scene renderers and shared scene components.
- `src/timeline.ts` — maps narration slots to scene timing.
- `src/video.ts` — interactive player and deterministic frame renderer.
- `tools/vo.ts` — line-based ElevenLabs generation and word alignment.
- `tools/sound.ts` — sound effects and optional music generation.
- `tools/render.ts` — render server, schedule, draft, 1080p, and 4K output.
- `tools/storyboard-gallery.ts` — builds the local visual-approval gallery from `project/storyboard-review.json`.
- `tools/mix.ts` — fades, ducking, loudness normalization, captions, and final mux.

## Content versus engine

Change content first in `project/`, `src/story.ts`, `src/script.ts`, and scene data. Change engine primitives only when the desired visual cannot be expressed with existing components. Promote a new primitive into the starter only after it works across more than one story.

## Determinism

The renderer uses a fixed stage, seeded texture/noise, measured audio, and frame-time-based animation. The same source and schedule should produce the same frames. Keep randomness seeded; never use unseeded `Math.random()` inside scene rendering.

## Visual review gallery

1. Render representative 16:9 frames under `out/style-frames/`.
2. List the frames and optional contact sheet in `project/storyboard-review.json`.
3. Run `npm run review:storyboard` to build `out/storyboard-review/index.html`.
4. Run `npm run review:serve` and read the actual local URL from Vite output.
5. Open that URL in Glean Tau’s visible in-app Browser sidebar before requesting approval.

Headless browsing can support internal QA but does not satisfy the visual approval gate.

## Long renders

Browser-to-FFmpeg frame uploads can fail during long runs. Use `--from`, `--to`, and `--out` to render bounded chunks on exact frame boundaries, then join them with FFmpeg concat. Verify the final count and decode the complete file.

## Adding a scene

1. Add the section and beat metadata to `src/story.ts`.
2. Add approved narration to both maps in `src/script.ts`.
3. Implement a `Scene` in `src/scenes/` using fixed 1920×1080 coordinates.
4. Register it in `src/scenes/index.ts`.
5. Add restrained sound cues to `src/sfx.ts`.
6. Compile, generate narration, review contact-sheet frames, then render.

## Safe source control

Commit source, templates, and approved local logo assets. Do not commit `.env`, generated narration/music/effects, render outputs, browser caches, or raw customer source material.
