---
name: produce-risograph-explainer-video
description: Produce an approved risograph storyboard as a narrated video, with a visible spoken-script review in Glean Tau before ElevenLabs generation, followed by timed animation, audio, captions, rendering, and QA. Use when the story and visual storyboard are approved.
---
# Produce the Risograph Editorial Explainer Video

Turn approved story and visuals into the final video without reopening scope silently. Script approval requires the complete clean narration to be visible inside Glean Tau; a duration summary or approval card alone is not sufficient.

## Preconditions

Read `project/STATUS.md`. Confirm the project-type, story, visible visual-review, and visual-storyboard gates are approved. Read `project/story.md`, `project/research-notes.md`, `project/visual-direction.md`, `project/storyboard.md`, `project/brand.md`, `project/facts-and-claims.md`, and the relevant files in `references/`.

Confirm that `project/STATUS.md` and `project/story.md` contain a target duration. If it is missing or still “not sure,” return to the story decision, recommend a target, and get confirmation before drafting the final spoken script.

## Draft the spoken script

1. Draft the complete clean narration in `project/script.md`. Write for listening and pair each line with a storyboard beat.
2. Use the approved target duration and approximately 145–175 spoken words per minute to set the word budget. State the total words, target duration, estimated duration, and any meaningful pacing risk.
3. Keep clean caption text separate from optional ElevenLabs delivery cues. Review every factual statement against `project/facts-and-claims.md`.
4. Populate `project/script-review.json` with every beat’s ID, storyboard beat, exact clean narration, expected seconds, optional delivery text, and pronunciation notes.

## Required visible script review gate

Complete every step below before asking the user to approve the script or configuring paid narration:

1. Run `npm run review:script`. Confirm it creates `out/script-review/index.html` and reports the expected word count, beat count, target duration, and estimated duration.
2. Start or reuse `npm run review:serve` as a non-interactive local process. Read its output to get the actual `127.0.0.1` base URL; the port can change when 5199 is occupied.
3. Use the browser-use workflow and explicitly choose the **visible in-app Browser**. Navigate the Glean Tau Browser sidebar to `<base-url>/script-review/`.
4. Verify in the visible panel that the complete clean read-through, all beat details, word count, target and estimated duration, and pronunciation notes render correctly. Keep the page open for the user.
5. Tell the user the complete script is open in the Browser sidebar. Only then ask them to approve it or request changes.
6. For revisions, update `project/script.md` and `project/script-review.json`, rerun `npm run review:script`, reload the visible review page, and ask again.

A headless or background browser can support internal QA, but it does **not** satisfy the script approval gate. An approval card that shows only the word count or duration also does not satisfy it. If the visible in-app Browser is unavailable, explain the blocker and pause; do not mark the script approved, configure ElevenLabs, or generate audio.

## Record script approval

After explicit approval given after the visible script review:

1. Record the visible review date, reviewer, target duration, estimated duration, and decision in `project/script.md`.
2. Mark both **Spoken script shown in Tau Browser panel** and **Spoken script approved** in `project/STATUS.md`.
3. Update the change log and `project/production-plan.md`.
4. Only then proceed to voice selection, `.env` setup, and paid generation.

## Produce the video

1. Update `src/story.ts`, `src/script.ts`, `src/sfx.ts`, and scenes. Prefer existing primitives in `src/ink.ts`, `src/motion.ts`, and `src/scenes/kit.ts`.
2. Keep logos local in `public/logos/` and update `src/logos.ts`. Record source and authorization in `project/brand.md`.
3. Run `npm run build`. Generate only new or changed narration lines with `npm run vo`; never reveal `.env` values.
4. Build timing from measured voice durations. Update `project/production-plan.md` with voice, model, tempo, resolution, and render decisions.
5. Render contact sheets for every beat. Inspect layout, first frame, logos, transitions, density, and visual-narration synchronization.
6. Generate SFX and music only when timing is stable. Mix narration as the dominant element and normalize near −14 LUFS unless the destination requires otherwise.
7. Render 1080p60 by default. If long renders fail, use exact `--from` and `--to` boundaries, render bounded chunks, join them, and verify count and joins.
8. Generate captions and thumbnail. Compare a transcript of the final mix with the approved script and decode the complete MP4 with FFmpeg.
9. Complete `QA_CHECKLIST.md`, present the output, and mark production complete in `project/STATUS.md` only after validation.

After the script review is complete, stop the temporary local server when it is no longer needed. Keep the generated review page until the project is complete.

## Change control

If production requires a material story or visual change, stop, explain the issue, return to the owning phase, and clear downstream approvals. Do not use production convenience to alter approved meaning.

## Side effects

Do not commit, push, publish, upload, or externally share unless the user explicitly authorizes that action. Keep `.env`, generated audio, review output, and rendered media out of Git by default.
