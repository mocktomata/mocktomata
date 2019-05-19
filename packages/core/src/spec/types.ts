import { KomondorPlugin } from '../plugin/types';

export type SpecIO = {
  readSpec(id: string): Promise<SpecRecord>,
  writeSpec(id: string, record: SpecRecord): Promise<void>
}

export type SpecRecord = {
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

/**
 * Meta data of the action.
 * Save information about the action during spying,
 * so that it can be used during stubbing to replay the behavior.
 */
export type Meta = Record<string, any>

export type SpecAction = ConstructAction | InvokeAction | GetAction | SetAction |
  ReturnAction | ThrowAction

export type ConstructAction = {
  type: 'construct',
  payload: any[],
  ref: string,
}

export type InvokeAction = {
  type: 'invoke',
  payload: any[],
  ref: string
}

export type ReturnAction = {
  type: 'return',
  payload: any,
  ref: string
}

export type ThrowAction = {
  type: 'throw',
  payload: any,
  ref: string
}

export type GetAction = {
  type: 'get',
  payload: string | number,
  ref: string
}

export type SetAction = {
  type: 'set',
  payload: [string | number, any],
  ref: string
}

export type SpyContext = any
export type StubContext = any
