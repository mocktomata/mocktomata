import { KomondorPlugin } from '../types';

export type SpecRecord2 = {
  refs: Record<string, SpecReferenceRecord>,
  actions: SpecAction[]
}

export type SpecRecordLive = {
  refs: Map<any, SpecReferenceLive>,
  actions: SpecAction[]
}

export type SpecReferenceRecord = SpecReferenceBase & {
  plugin: string,
  value?: any
}

export type SpecReferenceLive<T = any> = SpecReferenceBase & {
  plugin: KomondorPlugin<T>,
  ref: string
}

export type SpecReferenceBase = {
  subjectId?: number,
  instanceId?: number,
  invokeId?: number
}

export type SpecAction = {
  type: string,
  payload: any,
  ref?: string
}

export function toSpecRecord(record: SpecRecordLive): SpecRecord2 {
  return { refs: {}, actions: [] }
}
