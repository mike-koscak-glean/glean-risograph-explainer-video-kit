---
name: risograph-explainer-workflow
description: Orchestrate a complete risograph editorial explainer video from an early idea through story, visual storyboard, narration, rendering, and QA. Use when the user wants end-to-end help or is unsure which video phase comes next.
---
# Risograph Editorial Explainer Workflow

Use one shared engine and three gated phases. Resume from `project/STATUS.md`; do not restart completed work.

## Route the project

1. Read `project/STATUS.md`, `project/brief.md`, and `project/facts-and-claims.md`.
2. If the story is not approved, read and follow `.glean/skills/shape-risograph-video-story/SKILL.md`.
3. If the story is approved but the visual storyboard is not, read and follow `.glean/skills/design-risograph-video-storyboard/SKILL.md`.
4. If both are approved but production is incomplete, read and follow `.glean/skills/produce-risograph-explainer-video/SKILL.md`.
5. If production is complete, use `QA_CHECKLIST.md` to handle revisions or validate delivery.

A user can enter at a later phase only when the required earlier artifacts exist and the user confirms they are approved. Record that confirmation in `project/STATUS.md`.

## Phase boundaries

- **Story:** clarify audience, evidence, purpose, narrative arc, sections, and duration. Do not design frames or call paid APIs.
- **Visual storyboard:** choose metaphors, scenes, on-screen copy, brand treatment, and representative style frames. Do not generate final voice or render the full video.
- **Production:** finalize the spoken script, generate narration, implement timed scenes, mix audio, render, and validate.

If a later phase exposes a structural problem, return to the relevant earlier phase and clear downstream approvals in `project/STATUS.md`.

## Shared rules

- Keep confirmed, proposed, illustrative, and unknown information distinct.
- Never present assumed metrics, unstable dates, or directional value as achieved results.
- Preserve the risograph-inspired editorial language documented in `references/DESIGN_SYSTEM.md`.
- Never expose `.env` values, private source material, or signed URLs.
- Do not commit, push, upload, publish, or externally share without explicit user authorization.
