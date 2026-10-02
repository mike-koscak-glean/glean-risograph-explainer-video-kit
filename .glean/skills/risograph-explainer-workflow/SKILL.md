---
name: risograph-explainer-workflow
description: Orchestrate a general, customer-specific, or undecided risograph editorial explainer from rough notes or Glean research through story, visual storyboard, narration, rendering, and QA. Use for end-to-end help or when the next phase is unclear.
---
# Risograph Editorial Explainer Workflow

Use one shared engine and three gated phases. Resume from `project/STATUS.md`; do not restart completed work.

## Route the project

1. Read `project/STATUS.md`, `project/brief.md`, `project/intake-notes.md`, `project/research-notes.md`, and `project/facts-and-claims.md`.
2. Treat the current chat and freeform notes as valid intake. Do not block because the structured brief is incomplete.
3. If the project type is undecided or the story is not approved, read and follow `.glean/skills/shape-risograph-video-story/SKILL.md`.
4. If the story is approved but the visual storyboard is not, read and follow `.glean/skills/design-risograph-video-storyboard/SKILL.md`.
5. If both are approved but production is incomplete, read and follow `.glean/skills/produce-risograph-explainer-video/SKILL.md`.
6. If production is complete, use `QA_CHECKLIST.md` to handle revisions or validate delivery.

A user can enter at a later phase only when the required earlier artifacts exist and the user confirms they are approved. Record that confirmation in `project/STATUS.md`.

## Flexible intake

A project can start from any combination of:

- A rough topic or one-sentence goal
- Freeform notes in chat or `project/intake-notes.md`
- Files, URLs, calls, presentations, or other supplied sources
- An explicit request to search Glean for workplace or account context

Respect the selected research approach: **Search Glean**, **Supplied sources only**, **Both**, or **Ask first**. Glean search is useful for both general and customer-specific videos; it does not determine the project type by itself.

## Phase boundaries

- **Story:** confirm project type; gather requested context; clarify audience, evidence, purpose, narrative arc, sections, and duration. Do not design frames or call paid APIs.
- **Visual storyboard:** choose metaphors, scenes, on-screen copy, brand treatment, and representative style frames. Do not generate final voice or render the full video.
- **Production:** finalize the spoken script, generate narration, implement timed scenes, mix audio, render, and validate.

If a later phase exposes a structural problem, return to the relevant earlier phase and clear downstream approvals in `project/STATUS.md`.

## Shared rules

- Keep confirmed, proposed, illustrative, and unknown information distinct.
- Never present assumed metrics, unstable dates, directional value, or search findings as achieved results.
- Preserve source links and research gaps in `project/research-notes.md`.
- Preserve the risograph-inspired editorial language documented in `references/DESIGN_SYSTEM.md`.
- Never expose `.env` values, private source material, or signed URLs.
- Do not commit, push, upload, publish, or externally share without explicit user authorization.
