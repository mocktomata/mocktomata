import { SpecAction } from './SpecAction';
import { SpecReference } from './SpecReference';

export type SpecRecord = {
  refs: SpecReference[],
  actions: SpecAction[]
}
