import { titleScene } from './title';
import { journeyScene, closeScene } from './journey';
import { foundationScene } from './foundation';
import { useCaseScene } from './usecase';
import { agentsScene } from './agents';
import { valueScene } from './value';
import { pilotScene } from './pilot';
import { UC_ACCOUNT, UC_HANDOFF, UC_RFP, UC_SUPPORT } from '../story';
import type { Scene } from './types';

export const SCENES: Scene[] = [
  titleScene, // 0
  journeyScene, // 1 · ExampleCo today
  foundationScene, // 2 · how Glean works
  useCaseScene(UC_ACCOUNT), // 3
  useCaseScene(UC_HANDOFF), // 4
  useCaseScene(UC_RFP), // 5
  useCaseScene(UC_SUPPORT), // 6
  agentsScene, // 7
  valueScene, // 8
  pilotScene, // 9
  closeScene, // 10
];
