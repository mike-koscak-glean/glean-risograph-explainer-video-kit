// ─────────────────────────────────────────────────────────────
//  SOUND-EFFECT CUE SHEET
//  Key = "step.beat" (1-based beat). `at` = seconds into the beat's
//  choreography (the iris delay is already accounted for).
//  Iris transitions get a whoosh automatically.
//  Sound files: public/gen/sfx/<kind>.mp3 (see tools/sound.ts).
// ─────────────────────────────────────────────────────────────
import { ucSfx } from './scenes/usecase';
import { UC_ACCOUNT, UC_HANDOFF, UC_RFP, UC_SUPPORT } from './story';

export type SfxCue = { at: number; kind: SfxKind; gain?: number; abs?: boolean };
export type SfxKind = 'whoosh' | 'pop' | 'ticks' | 'stamp' | 'swish' | 'chime' | 'shimmer' | 'pour';

const uc = (step: number, u: Parameters<typeof ucSfx>[0]) => {
  const [a, b] = ucSfx(u);
  return { [`${step}.1`]: a, [`${step}.2`]: b };
};

export const SFX: Record<string, SfxCue[]> = {
  '0.1': [{ at: 0.05, kind: 'chime', gain: 0.55 }, { at: 1.1, kind: 'whoosh', gain: 0.6 }, { at: 1.75, kind: 'pop' }, { at: 2.3, kind: 'ticks', gain: 0.7 }],

  '1.1': [{ at: 0.3, kind: 'swish', gain: 0.7 }, { at: 0.4, kind: 'pop', gain: 0.8 }, { at: 0.9, kind: 'pop', gain: 0.6 }, { at: 1.2, kind: 'ticks', gain: 0.5 }],
  '1.2': [{ at: 0.1, kind: 'pour', gain: 0.6 }, { at: 0.35, kind: 'pop', gain: 0.7 }, { at: 0.95, kind: 'pop', gain: 0.6 }],
  '1.3': [{ at: 0.15, kind: 'swish', gain: 0.7 }, { at: 0.5, kind: 'ticks', gain: 0.6 }, { at: 2.4, kind: 'stamp' }],

  '2.1': [{ at: 0.4, kind: 'ticks' }, { at: 0.55, kind: 'pop' }, { at: 1.9, kind: 'pop', gain: 0.6 }],
  '2.2': [{ at: 0.3, kind: 'shimmer' }],
  '2.3': [{ at: 0.4, kind: 'ticks', gain: 0.7 }],

  ...uc(3, UC_ACCOUNT),
  ...uc(4, UC_HANDOFF),
  ...uc(5, UC_RFP),
  ...uc(6, UC_SUPPORT),

  '7.1': [{ at: 0.1, kind: 'pop', gain: 0.7 }, { at: 0.8, kind: 'swish' }, { at: 1.3, kind: 'ticks', gain: 0.6 }, { at: 2.6, kind: 'shimmer', gain: 0.6 }],
  '7.2': [{ at: 0.5, kind: 'pop' }, { at: 1.0, kind: 'shimmer', gain: 0.7 }, { at: 2.2, kind: 'ticks', gain: 0.6 }, { at: 3.7, kind: 'pop' }, { at: 3.95, kind: 'chime', gain: 0.7 }, { at: 4.2, kind: 'stamp', gain: 0.8 }],

  '8.1': [{ at: 0.1, kind: 'swish', gain: 0.7 }, { at: 1.3, kind: 'pour', gain: 0.6 }, { at: 2.2, kind: 'pop' }, { at: 3.1, kind: 'ticks', gain: 0.6 }, { at: 3.7, kind: 'stamp' }],
  '8.2': [{ at: 0.4, kind: 'pop', gain: 0.7 }, { at: 1.6, kind: 'shimmer', gain: 0.7 }, { at: 2.3, kind: 'ticks', gain: 0.6 }, { at: 3.8, kind: 'stamp' }],

  '9.1': [{ at: 0.3, kind: 'pop', gain: 0.7 }, { at: 0.6, kind: 'ticks', gain: 0.6 }, { at: 1.0, kind: 'pop' }],
  '9.2': [{ at: 0.2, kind: 'swish', gain: 0.7 }, { at: 1.5, kind: 'pop' }, { at: 1.8, kind: 'ticks', gain: 0.6 }],
  '9.3': [{ at: 0.2, kind: 'pop', gain: 0.7 }, { at: 0.7, kind: 'pop', gain: 0.5 }, { at: 1.2, kind: 'swish', gain: 0.5 }, { at: 1.5, kind: 'ticks', gain: 0.6 }, { at: 2.7, kind: 'pop', gain: 0.7 }, { at: 3.4, kind: 'stamp' }, { at: 3.45, kind: 'chime', gain: 0.7 }],

  '10.1': [{ at: 0.1, kind: 'shimmer', gain: 0.8 }, { at: 1.4, kind: 'ticks', gain: 0.6 }],
  '10.2': [{ at: 0.4, kind: 'swish', gain: 0.6 }, { at: 0.9, kind: 'pop' }, { at: 1.4, kind: 'chime' }],
};
