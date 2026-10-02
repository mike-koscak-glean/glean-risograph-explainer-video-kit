---
name: shape-risograph-video-story
description: Turn a rough idea, freeform notes, supplied sources, or Glean workplace research into an approved general or customer-specific risograph explainer story. Use when project type, audience, evidence, narrative, use cases, or duration still needs definition.
---
# Shape the Risograph Video Story

Produce an approved story before visual design or production begins. Treat the brief as a working aid, not a form the user must complete.

## Intake rules

1. Read `project/STATUS.md`, `project/brief.md`, `project/intake-notes.md`, `project/research-notes.md`, `project/facts-and-claims.md`, the current chat, and supplied source material.
2. Accept any useful starting point: a sentence, freeform notes, a customer or topic name, files or URLs, a request to search Glean, or a combination.
3. Do not ask the user to complete every brief field. Normalize what is already known into the project artifacts and ask one grouped round of questions only for gaps that materially change the story.
4. Do not request customer details for a general explainer. Do not assume a video is customer-specific because the starter contains an ExampleCo sample.

## Confirm target duration early

Treat approximate duration as a key story input. If the user did not provide one, ask about it in the first grouped intake question before drafting narrative angles. Offer simple choices:

- **Short:** about 60–90 seconds
- **Standard:** about 2–3 minutes
- **Deep:** about 4–6 minutes
- **Custom:** another target or range
- **Not sure:** Tau recommends a duration after reviewing the audience, distribution, number of concepts or use cases, and available evidence

“Not sure” is valid and must not block research. After context review, recommend one target with a short rationale and get confirmation before story approval. Do not silently inherit the length of the ExampleCo sample or choose a duration only after the script is written.

Record the target, whether it was user-provided or Tau-recommended, and how flexible it is in `project/brief.md`, `project/STATUS.md`, and `project/story.md`. Use it to control the number of sections, examples, and likely spoken-word budget.

## Choose the project type

Use these definitions:

- **General explainer:** teaches a durable idea, capability, workflow, or point of view. It can use workplace context or examples without centering one customer.
- **Customer-specific:** depends on one account’s context, language, people, brand, use cases, or proposed program.
- **Undecided:** retain this mode until context is sufficient. Recommend a type and explain the tradeoff before story approval.

Mode is not permanent during intake. Update `project/brief.md` and `project/STATUS.md` after the user confirms the type. Record the change; do not discard useful research.

## Gather context

Determine the research approach from the user, brief, or intake notes:

- **Search Glean:** use available Glean workplace search and document-reading tools.
- **Supplied sources only:** do not search beyond files, URLs, and notes the user provided.
- **Both:** combine Glean research with supplied material.
- **Ask first:** ask whether Tau should search Glean before doing so.

When Glean research is requested:

1. Derive concise searches from the topic, account, people, teams, projects, products, and time frame supplied by the user. Do not require the user to write search queries.
2. Search permission-aware workplace content. Read the most relevant underlying sources when a claim, date, metric, or customer detail matters; do not rely only on result titles or snippets.
3. Record searches, useful source URLs, findings, freshness or authority, conflicts, and gaps in `project/research-notes.md`.
4. Transfer candidate factual claims into `project/facts-and-claims.md` as **Confirmed**, **Proposed**, **Illustrative**, or **Unknown**. Research findings are not automatically approved for the video.
5. If Glean search is unavailable or returns insufficient evidence, state that limitation and continue from supplied material. Never fill gaps by guessing.

Freeform notes remain valid input even when they are incomplete, contradictory, or speculative. Preserve their intent and classify uncertain statements before using them.

## Shape the story

1. Identify the audience, decision or learning outcome, current tension, core idea, evidence limits, confirmed target duration, and closing action.
2. Draft two or three narrative angles when the best framing is not obvious. Explain each tradeoff in one sentence.
3. Recommend one angle and draft `project/story.md` using the output contract below.
4. Review every product fact, customer fact, system, date, metric, and value claim against `project/facts-and-claims.md`. Add missing entries rather than silently assuming them.
5. Present the project type and story for approval. Do not begin storyboard design, source editing, ElevenLabs generation, or rendering.
6. After explicit approval, mark the project-type and story gates and update the change log in `project/STATUS.md`.

## Story output contract

`project/story.md` must contain:

- Project type, working title, and one-sentence promise
- Audience and job to be done
- Core tension and narrative thesis
- Ordered sections, each with purpose and takeaway
- Concrete examples or use cases
- Evidence status, source boundaries, and unresolved questions
- Proposed opening and closing
- Confirmed target duration, source of the target, flexibility, and density recommendation
- Content intentionally excluded

## Quality bar

- The opening establishes why the video matters within 15 seconds.
- The story is understandable without detailed product knowledge.
- Each section advances one argument rather than listing features.
- General videos teach a durable concept; customer-specific videos stay grounded in approved account context.
- Glean research adds context without turning unapproved findings into claims.
- The story can be visualized, but this phase does not prescribe final scenes.
