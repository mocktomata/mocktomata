// #region Spec
export type SpecMode = 'live' | 'save' | 'simulate' | 'auto'

export type Spec<T> = {
  subject: T,
  done(): Promise<void>
}

export type SpecOptions = {
  timeout: number
}
// #endregion

export type SpecIO = {
  readSpec(ref: string): Promise<SpecRecord>,
  writeSpec(ref: string, record: SpecRecord): Promise<void>
}

export type SpecRecord = {
  refs: SpecReference[]
  actions: SpecAction[]
}

export type SpecReference = {
  /**
   * Name of the plugin
   */
  plugin: string

  subject?: any,

  /**
   * Indicates the reference subject needs to be serialized.
   * Examples of subjects need to be serialized are:
   * - strings
   * - return object or array not passing in from argument
   * Examples of subjects should not be serialized:
   * - instantiation of inbound classes.
   * - return function (cannot be done because scope can't be attached)
   */
  serialize?: true
}

export type SpecReferenceRecord = SpecReferenceBase & {
  plugin: string,
  value?: any
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

export type SpecAction = InstantiateAction | InvokeAction | GetAction | SetAction |
  ReturnAction | ThrowAction


export type InstantiateAction = {
  type: 'instantiate',
  ref: string,
  tick: number,
  payload: any[],
}

export type InvokeAction = {
  type: 'invoke',
  ref: string | number,
  tick: number,
  payload: any[],
}

export type ReturnAction = {
  type: 'return',
  ref: number,
  tick: number,
  payload: any,
}

export type ThrowAction = {
  type: 'throw',
  ref: number,
  tick: number,
  payload: any,
}

export type GetAction = {
  type: 'get',
  ref: string | number,
  tick: number,
  payload: string | number,
}

export type SetAction = {
  type: 'set',
  ref: string | number,
  tick: number,
  payload: [string | number, any]
}
