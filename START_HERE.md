# Start Here

The workflow is staggered: gather context, approve the story, approve the visuals, and only then produce the narrated video. A user can start from a rough idea, freeform notes, supplied sources, a Glean search request, or any combination.

## 1. Create a project

If the video type is not yet clear:

```bash
npm run new -- my-video --mode undecided
```

Or select a known type:

```bash
npm run new -- concept-explainer --mode general
npm run new -- customer-pilot --mode customer
```

Without `--mode`, the generator defaults to `undecided`.

## 2. Continue in the same Tau chat

Tell Tau to work from the folder it just created:

> Continue working from `videos/my-video/`. Read and follow `.glean/skills/risograph-explainer-workflow/SKILL.md`. Start with the story phase and pause for approval before each later phase.

Tau can navigate to the generated folder. A new chat or `/reload` is not required when Tau reads the workflow file directly.

## 3. Choose how to provide context

Use one or more inputs:

- A sentence describing the idea or desired outcome
- Freeform notes in chat or `project/intake-notes.md`
- Files, URLs, calls, notes, or presentations
- A request to search Glean for workplace, topic, project, or account context

Set the research approach to **Glean search**, **Supplied sources only**, **Both**, or **Ask first**. Tau records research and source links in `project/research-notes.md`.

The brief is a working aid, not a required form. Tau should ask only for missing information that materially changes the story.

## 4. Complete the gated phases

### Phase 1: Story

Tau confirms or recommends **General**, **Customer-specific**, or **Undecided**, gathers requested context, and produces:

- `research-notes.md`
- `facts-and-claims.md`
- `story.md`

No visual coding, ElevenLabs calls, or rendering occurs.

### Phase 2: Visual storyboard

After story approval, Tau produces:

- `brand.md`
- `visual-direction.md`
- `storyboard.md`
- Representative style frames and an optional contact sheet
- `out/storyboard-review/index.html`, built from `project/storyboard-review.json`

Tau serves this gallery locally and opens it in the **visible Glean Tau Browser sidebar**. The user reviews the displayed frames before approving the phase. A headless review, file path, or text summary does not count as approval.

No final narration or full render occurs.

### Phase 3: Production

After visual approval, install prerequisites and configure ElevenLabs:

```bash
node --version
ffmpeg -version
npm install
cp .env.example .env
```

Use Node.js 20 or newer. Add `ELEVENLABS_API_KEY` and the selected `ELEVEN_VOICE_ID` to `.env` without sharing the key in chat. Then Tau produces:

- `script.md`
- `production-plan.md`
- Timed scene code
- Narration, music, and sound effects
- Captions, thumbnail, final MP4, and QA record

## Direct phase entry

Users who already have approved work can invoke a specialist skill directly:

- `shape-risograph-video-story`
- `design-risograph-video-storyboard`
- `produce-risograph-explainer-video`

The required earlier artifacts must exist and be approved in `project/STATUS.md`.

## Production commands

Most users can let Tau run these after approval:

```bash
npm run build
npm run voices
npm run vo
npm run schedule
npm run sfx
npm run music
npm run render:draft
npm run render
npm run mix
npm run render:4k
```

The default final output is `out/risograph-explainer-video.mp4`. Before sharing, complete `QA_CHECKLIST.md`.
