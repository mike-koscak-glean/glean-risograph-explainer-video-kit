# Glean Risograph Editorial Explainer Video Kit

Create polished narrated videos in a consistent risograph-inspired editorial style: warm paper, halftone ink, bold typography, tactile sound, and diagram-led storytelling.

Use it for:

- **General explainers** that teach a Glean idea or capability.
- **Customer videos** that turn approved account context and use cases into a co-branded story.

## How the process works

Tau guides the project through three separate phases. You review and approve each phase before it moves forward:

1. **Create the story** — Tau reviews your source material, clarifies the audience and goal, separates confirmed facts from assumptions, and proposes the narrative structure. **Outcome: an approved story.**
2. **Design the visuals** — Tau translates the story into the risograph editorial style, including the visual metaphor, scenes, on-screen copy, logos, and representative style frames. **Outcome: an approved visual storyboard.**
3. **Produce the video** — Tau writes the spoken script, generates the approved ElevenLabs narration, builds and times the animation, adds music and effects, creates captions, and validates the final render. **Outcome: a finished narrated video.**

You can stop after any phase, provide feedback, and resume later. Tau records approvals and progress in the generated project.

## Fastest way to use this in Glean Tau

You do not need to write code. Give Tau the repository, your source material, and the outcome you want. Tau guides you through the story, visual design, and production in separate approval steps.

### 1. Ask Tau to download and prepare the kit

Start a Glean Tau chat and paste:

> Clone `https://github.com/mike-koscak-glean/glean-risograph-explainer-video-kit` to my computer. Create a new **customer** video project named `customer-pilot` from the kit. Do not start writing the video yet.

For a non-customer video, replace **customer** with **general**.

Tau will clone the repository and run the project generator. When it finishes, open the generated `videos/customer-pilot/` folder in Glean Tau.

### 2. Load the video skills

Start a new chat in the generated project or run `/reload`. Then paste:

> Use the `risograph-explainer-workflow` skill to help me create this video. Start with the story phase. Do not move to the next phase until I approve the current one.

Attach or link the relevant notes, calls, documents, presentations, and logo assets. Tell Tau:

- Who will watch the video.
- What they should understand or do afterward.
- Whether it is a general or customer-specific video.
- Your preferred duration; 3–4 minutes for a general explainer or 4–6 minutes for a customer story is a useful starting point.
- Any facts, systems, metrics, dates, or customer details that are proposed or still uncertain.

### 3. Approve three phases

| Phase | What Tau helps create | What you approve |
|---|---|---|
| **Story** | Audience, evidence, narrative angle, sections, examples, and duration | The story is accurate and worth telling |
| **Visual storyboard** | Visual metaphor, risograph treatment, scene plan, on-screen copy, logos, and sample frames | The visual approach communicates the story clearly |
| **Production** | Spoken script, ElevenLabs voice, timed animation, music, effects, captions, and final render | The final script, voice, visuals, and claims |

Tau records progress in `project/STATUS.md`, so you can stop after any phase and resume later.

### 4. Receive the outputs

A completed production normally includes:

- `out/risograph-explainer-video.mp4`
- `out/captions.srt`
- A thumbnail
- Approved story, storyboard, script, and production plan
- A completed QA checklist

## What the user is responsible for

The AE or video owner should:

1. Provide the strongest available source material.
2. Answer Tau’s questions about audience and desired outcome.
3. Confirm which customer facts and pilot details are approved.
4. Approve the story before visual work.
5. Approve the visual storyboard before paid voice or final rendering.
6. Review the completed video before sharing it.

Tau handles the project setup, writing support, visual implementation, narration timing, rendering, and technical validation.

## Set up ElevenLabs for narration

Story and visual design do **not** require ElevenLabs. You need it only when you are ready to audition voices or generate narration, sound effects, and music.

### 1. Create an ElevenLabs API key

Sign in to ElevenLabs, open the **API Keys** area in account settings, and create a key for this video workflow. Copy it somewhere temporarily and securely.

**Do not paste the key into a Tau chat, document, Slack message, or GitHub.** You will enter it directly into a local hidden file.

### 2. Ask Tau to prepare the hidden `.env` file

In the generated video project, tell Tau:

> Create `.env` by copying `.env.example`. Do not ask me for the API key and do not display the file contents. Tell me where the file is so I can paste the key myself.

The `.env` file is in the top level of the generated project, beside `package.json`. Files beginning with a period are hidden on macOS. If you use Finder, press **Command + Shift + .** to show hidden files.

Open `.env` yourself and replace the blank value:

```text
ELEVENLABS_API_KEY=paste_your_key_here
ELEVEN_VOICE_ID=
ELEVEN_MODEL=eleven_v3
```

Save the file. `.env` is already excluded from Git and must remain local.

If you prefer Terminal, run this from the generated project folder before opening the file:

```bash
cp .env.example .env
open -e .env
```

### 3. Choose and save a voice

After the key is saved, ask Tau:

> Run `npm run voices -- --n 3`. Show me the voice names and where the samples were saved, but never display my API key.

This creates sample MP3s in `public/gen/voices/` and prints each voice ID. Listen to them, choose one, and add its ID to `.env`:

```text
ELEVEN_VOICE_ID=the_selected_voice_id
```

The reference videos used Eric with ElevenLabs v3, but the best voice can vary by audience. Voice auditions use ElevenLabs credits.

### 4. Test before generating the full narration

- `npm run vo:scratch` uses a local macOS voice for free pacing checks. It does not require ElevenLabs.
- `npm run vo` generates and caches the approved narration line by line with ElevenLabs.
- `npm run sfx` and `npm run music` generate optional effects and music with ElevenLabs.

Only run paid generation after the spoken script is approved. Unchanged narration lines are cached, so revisions regenerate only what changed.

The production phase also requires Node.js 20 or newer plus FFmpeg and ffprobe. Tau can check these prerequisites for the user.

## Useful prompts

### Start with a rough idea

> I have an idea but not a complete story. Use `shape-risograph-video-story` to help me determine the audience, core argument, examples, and duration.

### Start with an approved story

> My story is approved. Use `design-risograph-video-storyboard` to translate it into the kit’s visual style. Do not generate voice or render the full video yet.

### Produce an approved storyboard

> The story and visual storyboard are approved. Use `produce-risograph-explainer-video` to draft the spoken script for my approval, then produce and validate the final video.

### Resume existing work

> Read `project/STATUS.md` and use `risograph-explainer-workflow` to continue from the next incomplete phase.

## More detail

- [START_HERE.md](START_HERE.md) — setup and direct skill entry
- [WORKFLOW.md](WORKFLOW.md) — phase boundaries and approval logic
- [SKILLS.md](SKILLS.md) — what each Tau skill does
- [references/DESIGN_SYSTEM.md](references/DESIGN_SYSTEM.md) — the risograph editorial aesthetic
- [references/STORY_AND_SCRIPT_GUIDE.md](references/STORY_AND_SCRIPT_GUIDE.md) — narrative and spoken-script guidance
- [references/ELEVENLABS_AND_AUDIO.md](references/ELEVENLABS_AND_AUDIO.md) — voice and audio workflow
- [QA_CHECKLIST.md](QA_CHECKLIST.md) — final review criteria

## Disclaimer and distribution

This repository is public and includes Glean branding, third-party product marks, example assets, and internal workflow guidance. Review trademarks, fonts, customer confidentiality, source permissions, and generated-media terms before reuse or redistribution.

Customer names, logos, source documents, and use cases require permission for the intended audience. The supplied logo reference inventory does not grant redistribution rights. Third-party marks remain owned by their respective companies.

Generated project folders, `.env`, narration, music, effects, renders, and `node_modules` are ignored. Never commit API keys, raw private customer material, signed URLs, or unapproved customer claims.
