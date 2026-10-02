// ─────────────────────────────────────────────────────────────
//  Timeline: turns narration durations + scene choreography into
//  an absolute schedule. Each beat starts shortly before its line
//  and lasts until BOTH its animation and its line have finished.
// ─────────────────────────────────────────────────────────────
import { LINES, SCENE_BREAKS, estimateSeconds } from './script';
import { SCENES } from './scenes';
import { SFX } from './sfx';

export const TIMING = {
  firstStart: 0.0, // the title card animates from frame 0
  introLead: 1.3 + 1.5, // logo opener (1.5 s) + title lands, then the voice starts
  beatLead: 0.25, // beat start → voice start (same step)
  stepLead: 0.85, // beat start → voice start (after an iris transition)
  breakGap: 0.7, // extra breath held on the previous example before a new one
  breakLead: 0.75, // new example: its card slides in before the voice starts
  transGate: 0.37, // scene time is held while the iris opens
  tail: 0.45, // silence after a line before the next beat
  endHold: 4.5, // hold on the end card after the last line
};

export type Slot = {
  id: string;
  step: number;
  beat: number;
  text: string;
  start: number;
  end: number;
  voStart: number;
  voDur: number;
};
export type SfxEvent = { at: number; kind: string; gain: number };
export type Schedule = { slots: Slot[]; sfx: SfxEvent[]; total: number; estimated: boolean };

export type VoInfo = Record<string, { dur: number }>;

export function buildSchedule(vo: VoInfo | null): Schedule {
  const slots: Slot[] = [];
  let t = TIMING.firstStart;
  LINES.forEach((ln, k) => {
    const prev = LINES[k - 1];
    const newStep = !prev || prev.step !== ln.step;
    const isBreak = SCENE_BREAKS.has(ln.id);
    if (isBreak && slots.length) {
      slots[slots.length - 1].end += TIMING.breakGap;
      t += TIMING.breakGap;
    }
    const lead = k === 0 ? TIMING.introLead : newStep ? TIMING.stepLead : isBreak ? TIMING.breakLead : TIMING.beatLead;
    const voDur = vo?.[ln.id]?.dur ?? estimateSeconds(ln.text);
    const anim = SCENES[ln.step].durations[ln.beat] + (newStep && k > 0 ? TIMING.transGate : 0);
    const start = t;
    const voStart = start + lead;
    const isLast = k === LINES.length - 1;
    const end = Math.max(start + anim, voStart + voDur + (isLast ? TIMING.endHold : TIMING.tail));
    slots.push({ id: ln.id, step: ln.step, beat: ln.beat, text: ln.text, start, end, voStart, voDur });
    t = end;
  });
  // sound effects: beat-relative cues → absolute times
  const sfx: SfxEvent[] = [];
  for (const s of slots) {
    const newStep = s.beat === 0 && s.step > 0;
    const local = newStep ? TIMING.transGate : 0;
    if (newStep) sfx.push({ at: s.start, kind: 'whoosh', gain: 0.9 });
    for (const c of SFX[`${s.step}.${s.beat + 1}`] ?? []) {
      const at = s.start + (c.abs ? c.at : local + c.at);
      if (at < s.end + 0.5) sfx.push({ at, kind: c.kind, gain: c.gain ?? 1 });
    }
  }
  sfx.sort((a, b) => a.at - b.at);
  return { slots, sfx, total: t, estimated: !vo };
}
