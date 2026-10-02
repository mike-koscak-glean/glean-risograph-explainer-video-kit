# Riso Editorial Explainer Design System

This system combines editorial information design with tactile risograph-print cues. It should feel intelligent, human, and crafted—not like a generic product demo.

## Stage and output

- Compose in a fixed 1920×1080 stage.
- Deliver 16:9 at 1080p60 by default; use 4K60 only when needed.
- Keep essential content inside roughly 70 px horizontal and 50 px vertical safe margins.
- Design for normal playback size, not only full-screen review.

## Palette

| Token | Hex | Role |
|---|---|---|
| Paper | `#f4ecdc` | Main background |
| Paper 2 | `#ebe0c9` | Secondary paper/shadow |
| Card | `#fffaf0` | Cards and readable surfaces |
| Navy | `#1c1f4a` | Primary type and outlines |
| Glean blue | `#3a4bff` | Main action and connected state |
| Coral | `#ff6b4a` | Tension, manual work, risk |
| Lime | `#d4f542` | Proof, completion, positive change |
| Grey | `#9c98a6` | Inactive or uncertain state |
| Customer accent | project-specific | Use sparingly for co-branding |

Use a limited spot-ink palette in each scene. Do not introduce many gradients or arbitrary colors.

## Typography

- Display: **Bricolage Grotesque**, weights 700–800.
- Body: **DM Sans**, weights 400–700.
- Labels: **DM Mono**, weights 400–500 with tracking.
- Headlines should be short enough to read while listening.
- Avoid dense paragraphs. Use narration for detail and visuals for structure.

The starter loads these fonts from Google Fonts. Confirm distribution and offline requirements before changing the source.

## Texture and illustration

- Warm paper background with restrained grain.
- Halftone dot screens instead of smooth digital shadows.
- Slight color misregistration on headlines, cards, and outlines.
- Offset ink shadows and rubber-stamp conclusions.
- Illustrated people use simple, friendly, repeatable forms.
- Logos sit on clean paper discs or cards so their brand colors remain legible.

Texture must support comprehension. If a logo, label, or chart becomes harder to read, reduce the effect.

## Composition

- One primary idea per narration beat.
- Use large shapes and clear directional flow.
- Prefer progressive disclosure: system cards → connections → answer.
- Reserve the upper band for the section kicker, headline, subtitle, and co-brand lockup.
- Use repeated geometry to create rhythm across scenes.
- Keep the result visually asymmetric but balanced.

## Motion

- Build timing from the measured narration, not estimated reading time.
- Use eased entrances and small overshoot for cards, chips, and stamps.
- Use handover cross-fades between related beats; avoid abrupt replacement.
- Add subtle stepped “boil” to preserve the printed/handmade character.
- Animate causal relationships: inputs arrive before the graph or answer appears.
- Keep decorative motion subordinate to spoken meaning.

## Reusable visual grammar

- **Opener:** co-brand lockup, short promise, tactile paper field.
- **Journey:** people or teams along one continuous road.
- **Silos:** separated cards with source logos and broken handoffs.
- **Index/orbit:** source systems orbit a central Glean index.
- **Graph:** account, people, topics, documents, and activity connected explicitly.
- **Today vs. with Glean:** coral manual-work state followed by blue/lime connected state.
- **Brief card:** cited answer rows linked to source logos.
- **Agent:** repeatable steps, approval, and distribution.
- **Value:** capacity and workflow proof, not unsupported ROI claims.
- **Scorecard:** compare against the customer’s own baseline; avoid invented percentages.
- **Close:** return to the opening metaphor and simplify the frame.

## Do

- Explain the system with concrete examples.
- Make citations, permissions, and source connections visible.
- Use fictional names when customer approval is absent.
- Keep labels brief and spoken-language friendly.
- Use stamps for conclusions, not decoration on every frame.

## Avoid

- Generic stock-video transitions.
- Tiny dashboards with unreadable text.
- Unsupported performance or quality metrics.
- Logos fetched directly during rendering.
- More than one dominant visual metaphor in a beat.
- Smooth corporate gradients that conflict with the print language.
