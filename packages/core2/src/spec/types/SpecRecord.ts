import { Meta } from './Meta';

// May need to expand this and specialize it for Spy and Stub
export type SpecRecord = {
  refs: SpecReference[],
  actions: SpecAction[]
}
export type ReferenceId = string

export type ActionMode = 'autonomous' | 'passive' | 'inherit'

export type SpecReference = {
  /**
   * Name of the plugin
   */
  plugin: string,

  subject?: any,

  testDouble?: any,

  mode: ActionMode,

  /**
   * Meta data supplied by the plugin.
   */
  meta?: Meta,

  source?: {
    ref: ActionId,
    site: Array<string | number>
  }
}

export type ActionId = number

/**
 * Key types that works with `komondor`.
 * Note that `symbol` is not supported.
 */
export type SupportedKeyTypes = string | number

export type SpecAction = InvokeAction | InstantiateAction | GetAction | ReturnAction | ThrowAction

export type SpecActionBase = {
  type: string,
  ref: ReferenceId | ActionId,
  payload: any
}

export type InstantiateAction = {
  type: 'instantiate',
  ref: ReferenceId,
  tick: number,
  payload: any[],
  meta?: Meta
}

export type InvokeAction = {
  type: 'invoke',
  ref: ReferenceId | ActionId,
  tick: number,
  mode: ActionMode,
  payload: any[],
  meta?: Meta
}

export type ReturnAction = {
  type: 'return',
  ref: ActionId,
  tick: number,
  payload: any,
  meta?: Meta,
}

export type ThrowAction = {
  type: 'throw',
  ref: ActionId,
  tick: number,
  payload: any,
  meta?: Meta,
}

export type GetAction = {
  type: 'get',
  ref: ReferenceId | ActionId,
  tick: number,
  payload: SupportedKeyTypes,
}

export type SetAction = {
  type: 'set',
  ref: ReferenceId | ActionId,
  tick: number,
  payload: [SupportedKeyTypes, any]
}
