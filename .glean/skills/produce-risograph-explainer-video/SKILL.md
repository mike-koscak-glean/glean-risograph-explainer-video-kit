---
name: produce-risograph-explainer-video
description: Produce an approved risograph editorial explainer storyboard as a narrated video with ElevenLabs, timed Canvas animation, music, effects, captions, rendering, and QA. Use when the story and visual storyboard are approved.
---
# Produce the Risograph Editorial Explainer Video

Turn approved story and visuals into the final video without reopening scope silently.

## Preconditions

Read `project/STATUS.md`. Confirm the project-type, story, visible visual-review, and visual-storyboard gates are approved. Read `project/story.md`, `project/research-notes.md`, `project/visual-direction.md`, `project/storyboard.md`, `project/brand.md`, `project/facts-and-claims.md`, and the relevant files in `references/`.

## Workflow

1. Draft the spoken narration in `project/script.md`. Write for listening and pair each line with a storyboard beat. Target approximately 145–175 words per minute.
2. Present the complete clean script and expected duration for approval. Do not call paid APIs before approval.
3. Update `src/story.ts`, `src/script.ts`, `src/sfx.ts`, and scenes. Prefer existing primitives in `src/ink.ts`, `src/motion.ts`, and `src/scenes/kit.ts`.
4. Keep logos local in `public/logos/` and update `src/logos.ts`. Record source and authorization in `project/brand.md`.
5. Run `npm run build`. Generate only new or changed narration lines with `npm run vo`; never reveal `.env` values.
6. Build timing from measured voice durations. Update `project/production-plan.md` with voice, model, tempo, resolution, and render decisions.
7. Render contact sheets for every beat. Inspect layout, first frame, logos, transitions, density, and visual-narration synchronization.
8. Generate SFX and music only when timing is stable. Mix narration as the dominant element and normalize near −14 LUFS unless the destination requires otherwise.
9. Render 1080p60 by default. If long renders fail, use exact `--from` and `--to` boundaries, render bounded chunks, join them, and verify count and joins.
10. Generate captions and thumbnail. Compare a transcript of the final mix with the approved script and decode the complete MP4 with FFmpeg.
11. Complete `QA_CHECKLIST.md`, present the output, and mark production complete in `project/STATUS.md` only after validation.

## Change control

If production requires a material story or visual change, stop, explain the issue, return to the owning phase, and clear downstream approvals. Do not use production convenience to alter approved meaning.

## Side effects

Do not commit, push, publish, upload, or externally share unless the user explicitly authorizes that action. Keep `.env`, generated audio, and rendered media out of Git by default.
