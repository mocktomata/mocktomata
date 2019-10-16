import { Meta } from './Meta';

export type SpecIO = {
  readSpec(ref: string): Promise<SpecRecord>,
  writeSpec(ref: string, record: SpecRecord): Promise<void>
}

// May need to expand this and specialize it for Spy and Stub
export type SpecRecord = {
  refs: SpecReference[],
  actions: SpecAction[]
}
export type ReferenceId = string

export type ReferenceSource = {
  ref: ReferenceId | ActionId,
  site: Array<string | number> | undefined
}

export type ActionMode = 'autonomous' | 'passive' | 'plugin-invoked' | 'instantiate' | undefined

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

  source?: ReferenceSource
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
  mode: ActionMode,
  instanceId: ReferenceId,
  payload: any[],
  meta?: Meta
}

export type InvokeAction = {
  type: 'invoke',
  // Invoke action ref can only be ActionId if we handle getter/setter.
  ref: ReferenceId, // | ActionId,
  tick: number,
  mode: ActionMode,
  site?: Array<string | number>,
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
