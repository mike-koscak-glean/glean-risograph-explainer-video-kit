import type { Ctx } from '../ink';
import type { Pt } from '../motion';

export type SceneState = {
  /** Index of the active beat. */
  beat: number;
  /** Local time (s) of each beat. Past beats = full duration; future = 0. */
  bt: number[];
  /** Global clock (s) for ambient motion. */
  time: number;
};

export type Scene = {
  /** Duration (s) of each beat's choreography. Length must match STEPS[i].beats. */
  durations: number[];
  /** Where the iris transition opens from / closes to. */
  focus: (st: SceneState) => Pt;
  render: (ctx: Ctx, st: SceneState) => void;
};

/** Time inside beat `i` (0 if not reached, full if passed). */
export const tb = (st: SceneState, i: number) => st.bt[i] ?? 0;
