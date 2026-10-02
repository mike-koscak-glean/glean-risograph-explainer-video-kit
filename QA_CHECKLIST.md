# Video QA Checklist

## Story and claims
- [ ] Audience and job are explicit.
- [ ] The first 15 seconds establish the tension and promise.
- [ ] Narration is conversational and understandable when heard once.
- [ ] Confirmed facts, proposals, illustrations, and unknowns are separated.
- [ ] No unapproved metric, date, system, customer detail, or ROI claim appears.
- [ ] Customer and brand owners approved the relevant content.

## Visuals
- [ ] One primary visual idea appears per narration beat.
- [ ] Text remains readable at normal playback size.
- [ ] Logos are local, sharp, correctly cropped, and authorized.
- [ ] No first-frame blank, clipping, overflow, or abrupt visual pop occurs.
- [ ] Contact sheets were reviewed for every beat.
- [ ] The visual storyboard gallery was opened in the visible Glean Tau Browser panel before approval.
- [ ] Visual approval was based on the displayed frames, not only a text summary or headless review.
- [ ] Cross-fades and transitions were checked at their midpoint.

## Audio
- [ ] The complete clean script was opened in the visible Glean Tau Browser panel before approval.
- [ ] Script approval was based on the displayed narration, not only a word-count or duration summary.
- [ ] Target duration, estimated duration, and spoken-word budget were reviewed.
- [ ] Voice, model, pacing, and pronunciations are approved.
- [ ] Every narration line matches the approved script.
- [ ] No clipped word onset, click, or unnatural gap is audible.
- [ ] Music stays under narration and resolves cleanly.
- [ ] Final mix is normalized near −14 LUFS unless distribution requires another target.
- [ ] Captions match the final narration.

## Technical
- [ ] `npm run build` passes.
- [ ] Final video is 16:9 at the intended resolution and frame rate.
- [ ] Frame count and duration match the schedule.
- [ ] FFmpeg decodes the full file without errors.
- [ ] First, middle, transition, and final frames were inspected.
- [ ] Secrets, generated audio, customer sources, and private URLs are not committed.
