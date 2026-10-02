# Start Here

The recommended experience is staggered. Begin with an idea, approve the story, approve the visuals, and only then produce the narrated video.

## 1. Install prerequisites

```bash
node --version
npm --version
ffmpeg -version
ffprobe -version
```

Use Node.js 20 or newer. ElevenLabs is not needed during the story or visual phase.

## 2. Create a project

From the kit root:

```bash
npm run new -- my-video --mode general
```

For a customer-specific story:

```bash
npm run new -- customer-name-pilot --mode customer
```

## 3. Begin in Glean Desktop

Open `videos/<name>/` in Glean Desktop. Start a new session or run `/reload`, then say:

> Use the risograph-explainer-workflow skill to help me continue this project.

Tau reads `project/STATUS.md` and begins the correct phase.

### Phase 1: Story

Complete `project/brief.md` with what you know. Tau helps produce and approve:

- `facts-and-claims.md`
- `story.md`

No visual coding, ElevenLabs calls, or rendering occurs.

### Phase 2: Visual storyboard

After story approval, Tau produces and reviews:

- `brand.md`
- `visual-direction.md`
- `storyboard.md`
- Representative style frames or a contact sheet

No final narration or full render occurs.

### Phase 3: Production

After visual approval, configure ElevenLabs:

```bash
npm install
cp .env.example .env
npm run voices
```

Add `ELEVENLABS_API_KEY` and `ELEVEN_VOICE_ID` to `.env`. Then Tau produces:

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
