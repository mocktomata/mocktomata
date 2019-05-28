import { SpecAction, SpecReference } from './types';

export type SpecRecordLive = {
  refs: SpecReferenceLive[],
  actions: SpecAction[]
}

export type SpecReferenceLive = SpecReference & {
  target?: any
}
