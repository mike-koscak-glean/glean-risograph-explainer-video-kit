# Staggered Risograph Editorial Explainer Workflow

The kit is one package with one engine and four project skills. It supports general explainers, customer-specific videos, and projects whose type is not yet decided.

## Flexible intake

The story phase can begin from any combination of:

- A rough idea or outcome
- Freeform notes in chat or `project/intake-notes.md`
- Supplied files, URLs, calls, notes, or presentations
- A request to search Glean for workplace or account context

The user selects **Glean search**, **Supplied sources only**, **Both**, or **Ask first**. Tau records searches, sources, findings, and gaps in `project/research-notes.md`. The structured brief is optional working context, not a questionnaire that must be completed.

Approximate duration is a required early decision: **short (60–90 seconds)**, **standard (2–3 minutes)**, **deep (4–6 minutes)**, custom, or **not sure—recommend one**. If unsure, Tau recommends and confirms a target before story approval.

## End-to-end entry point

Invoke `risograph-explainer-workflow` when:

- The user has only an idea, miscellaneous notes, or source material.
- The user wants Tau to search Glean before shaping the story.
- The project might be general or customer-specific.
- The correct next phase is unclear.
- Work should resume from an existing project.
- The user wants Tau to manage all approval gates.

The orchestrator reads `project/STATUS.md` and the intake artifacts, then loads the appropriate specialist skill.

## Phase 1 — Shape the story

Invoke `shape-risograph-video-story` when project type, audience, purpose, evidence, narrative arc, examples, or duration is not approved.

**Ends with:** confirmed project type and target duration, `research-notes.md`, `facts-and-claims.md`, `story.md`, and updated status.

**Does not do:** final visual design, scene coding, ElevenLabs, or rendering.

## Phase 2 — Design the visual storyboard

Invoke `design-risograph-video-storyboard` when the story is approved but the visual metaphor, scene plan, on-screen copy, brand treatment, and style frames are not.

**Ends with:** `visual-direction.md`, `storyboard.md`, representative style frames, and `out/storyboard-review/index.html` opened in the visible Glean Tau Browser sidebar.

The user must inspect the visible gallery before approval. Headless or background review can support QA but cannot satisfy this gate.

**Does not do:** paid voice generation or a full final render.

## Phase 3 — Produce the video

Invoke `produce-risograph-explainer-video` when story and visuals are approved.

Tau first builds `out/script-review/index.html` and opens the complete spoken script in the visible Glean Tau Browser sidebar. The user must inspect that page before script approval. A word-count or duration summary, approval card, or headless review cannot satisfy this gate.

After approval, Tau runs `npm run env:setup` to create `.env` automatically, stops for the user to enter the key locally, and runs `npm run env:check`. Missing `.env.example`, a missing key, or a missing voice must produce a clear user handoff—not a failed paid command. ElevenLabs generation begins only after the environment and voice checks pass.

**Ends with:** visibly reviewed and approved script, ElevenLabs narration, timed animation, final mix, captions, thumbnail, MP4, and completed QA.

## Returning to an earlier phase

Feedback can invalidate downstream work. If a story change affects the storyboard, clear both visual and production approvals. If a visual change affects only implementation, keep story approval and clear production approval. Record the decision in `project/STATUS.md`.

## Direct-entry examples

- “I have rough notes; help me decide what the story is.” → Phase 1
- “Search Glean for current context about this topic, then recommend general or customer-specific.” → Phase 1
- “I already have an approved six-part story; visualize it and show me the gallery in Tau’s Browser sidebar.” → Phase 2
- “The storyboard is approved; show me the full script in Tau’s Browser sidebar before generating narration.” → Phase 3
- “Help me make one of these videos.” → Orchestrator
