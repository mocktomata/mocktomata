import { SpecAction } from './SpecAction';
import { SpecReference } from './SpecReference';

// May need to expand this and specialize it for Spy and Stub
export type SpecRecord = {
  refs: SpecReference[],
  actions: SpecAction[]
}
