---
name: design-risograph-video-storyboard
description: Convert an approved story into the risograph editorial visual language, storyboard, and style frames, then open a visible review gallery in Glean Tau before requesting approval. Use when the story exists but the visual approach is not approved.
---
# Design the Risograph Video Storyboard

Translate the approved story into a visual system before voice generation or full production. Visual approval requires a visible review inside Glean Tau; a text summary or background inspection is not sufficient.

## Preconditions

Read `project/STATUS.md` and confirm the project-type and story gates are approved. Read `project/story.md`, `project/research-notes.md`, `project/brand.md`, `project/facts-and-claims.md`, and `references/DESIGN_SYSTEM.md`.

## Create the visual direction

1. Identify the central visual metaphor and repeated visual grammar for the story.
2. Define the palette, customer accent, logo plan, personas, system marks, typography, and co-brand treatment in `project/visual-direction.md`.
3. Draft `project/storyboard.md`: one row per visual beat with section, purpose, visual action, on-screen copy, evidence status, and rough duration.
4. Keep one primary visual idea per beat. Use narration for detail and visuals for structure.
5. Prefer the existing scene grammar: opener, journey, silos, index/orbit, graph, today-versus-Glean, cited brief, agent, value, scorecard, and closing return.
6. Create representative 16:9 static style frames for at least the opener, one dense middle scene, a transition, and the close. Create a contact sheet when practical. Use placeholder timing; do not call ElevenLabs or render the full video.
7. Inspect the frames for readability, clipping, density, visual hierarchy, and risograph consistency. Inspect logos for crop, contrast, local loading, source, and permission. Never hotlink assets during rendering.

## Required visible review gate

Complete every step below before asking the user to approve the visual direction:

1. Save review images outside source control, preferably under `out/style-frames/`.
2. Populate `project/storyboard-review.json` with the gallery title, summary, storyboard path, optional contact sheet, and every representative frame. Include each frame’s beat ID, title, audience takeaway, on-screen copy, evidence status, and notes.
3. Run `npm run review:storyboard`. Confirm it creates `out/storyboard-review/index.html` and that every listed image loads.
4. Start `npm run review:serve` as a non-interactive local process. Read its output to get the actual `127.0.0.1` base URL; the port can change if 5199 is occupied.
5. Use the browser-use workflow and explicitly choose the **visible in-app Browser**. Navigate the Glean Tau Browser sidebar to `<base-url>/storyboard-review/`.
6. Verify in the visible panel that the contact sheet, representative frames, labels, and storyboard source render correctly. Keep the gallery tab open for the user.
7. Tell the user the gallery is open in the Browser sidebar. Ask them to inspect it and either approve the visual direction or identify revisions.
8. For revisions, update the storyboard or frames, rerun `npm run review:storyboard`, reload the visible gallery, and ask again.

A headless or background browser can support internal rendering and QA, but it does **not** satisfy the approval gate. Finder, Preview, a file path, or a written description also does not satisfy it. If the visible in-app Browser is unavailable, explain the blocker and pause; do not mark the visuals approved or advance to production.

After the user finishes the review, stop the temporary local server when it is no longer needed. Keep the generated gallery files for later reference until the project is complete.

## Record approval

After explicit approval given after the visible gallery review:

1. Record the gallery path and review notes in `project/storyboard.md`.
2. Mark both **Visual review shown in Tau Browser panel** and **Visual direction and storyboard approved** in `project/STATUS.md`.
3. Add the decision and any conditions to the change log.
4. Only then return control to the orchestrator for production.

## Visual output contract

- `project/visual-direction.md` documents the visual metaphor, palette, brand treatment, motion behavior, and reusable components.
- `project/storyboard.md` covers every proposed beat, states what the audience should understand, and records the visible review.
- `project/storyboard-review.json` builds a local review gallery with representative 16:9 style frames.
- `out/storyboard-review/index.html` is the visible approval artifact.
- No unsupported metric, date, logo, or customer detail appears in visual copy.

If the storyboard reveals a weak narrative, return to the story phase and clear story-dependent approvals rather than hiding the problem with design.
