# Risograph Editorial Explainer Workflow Status

## Project
- Name:
- Mode: General / Customer-specific / Undecided
- Context approach: Glean search / Supplied sources only / Both / Ask first
- Target duration: Short 60–90 sec / Standard 2–3 min / Deep 4–6 min / Custom / Not sure
- Duration source: User-provided / Tau-recommended / Not confirmed
- Duration flexibility: Fixed / Approximate / Flexible
- Owner:
- Current phase: Story
- Last updated:

## Approval gates
- [ ] Project type confirmed
- [ ] Story approved
- [ ] Visual review shown in Tau Browser panel
- [ ] Visual direction and storyboard approved
- [ ] Spoken script shown in Tau Browser panel
- [ ] Spoken script approved
- [ ] Local `.env` prepared
- [ ] ElevenLabs API key check passed
- [ ] ElevenLabs voice selected and checked
- [ ] Production and QA complete

Only mark a gate after explicit user approval. If an earlier artifact changes materially, clear all dependent downstream gates.

## Required artifacts

| Artifact | Owner phase | State | Notes |
|---|---|---|---|
| `brief.md` | Intake | Draft | Working intake; not a required questionnaire |
| `intake-notes.md` | Intake | Draft | Freeform input; may remain sparse |
| `research-notes.md` | Story | Not started | Glean and supplied-source research log |
| `facts-and-claims.md` | Story | Draft | |
| `story.md` | Story | Not started | |
| `brand.md` | Story / Visual | Draft | |
| `visual-direction.md` | Visual | Not started | |
| `storyboard.md` | Visual | Not started | |
| `storyboard-review.json` | Visual | Not started | Visible gallery manifest |
| `out/storyboard-review/index.html` | Visual | Not started | Open in Tau Browser sidebar before approval |
| `script.md` | Production | Not started | Complete clean narration and review record |
| `script-review.json` | Production | Not started | Visible script-review manifest |
| `out/script-review/index.html` | Production | Not started | Open in Tau Browser sidebar before approval |
| `.env` | Production | Not started | Local only; never display, share, or commit |
| `production-plan.md` | Production | Not started | |
| `QA_CHECKLIST.md` | Production | Not started | |

## Open questions

## Change log
- Date — change — approval impact
