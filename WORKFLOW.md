# Staggered Risograph Editorial Explainer Workflow

The kit is one package with one engine and four project skills. Users can start with the orchestrator or enter a specialist phase directly.

## End-to-end entry point

Invoke `risograph-explainer-workflow` when:

- The user has only an idea or source material.
- The correct next phase is unclear.
- Work should resume from an existing project.
- The user wants Tau to manage all approval gates.

The orchestrator reads `project/STATUS.md` and loads the appropriate specialist skill.

## Phase 1 — Shape the story

Invoke `shape-risograph-video-story` when the audience, purpose, evidence, narrative arc, examples, or duration is not approved.

**Ends with:** `story.md` and updated facts/claims.

**Does not do:** final visual design, scene coding, ElevenLabs, or rendering.

## Phase 2 — Design the visual storyboard

Invoke `design-risograph-video-storyboard` when the story is approved but the visual metaphor, scene plan, on-screen copy, brand treatment, and style frames are not.

**Ends with:** `visual-direction.md`, `storyboard.md`, and representative style frames.

**Does not do:** paid voice generation or a full final render.

## Phase 3 — Produce the video

Invoke `produce-risograph-explainer-video` when story and visuals are approved.

**Ends with:** approved script, ElevenLabs narration, timed animation, final mix, captions, thumbnail, MP4, and completed QA.

## Returning to an earlier phase

Feedback can invalidate downstream work. If a story change affects the storyboard, clear both visual and production approvals. If a visual change affects only implementation, keep story approval and clear production approval. Record the decision in `project/STATUS.md`.

## Direct-entry examples

- “I have a rough topic but no story.” → Phase 1
- “I already have an approved six-part story; help me visualize it.” → Phase 2
- “The storyboard is approved; write the final spoken script and produce it.” → Phase 3
- “Help me make one of these videos.” → Orchestrator
