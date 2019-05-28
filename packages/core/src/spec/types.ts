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
  readSpec(id: string): Promise<SpecRecord>,
  writeSpec(id: string, record: SpecRecord): Promise<void>
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

  subject: any,

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

export type SpecAction = ConstructAction |
  InvokeAction | InvokeReturnAction | InvokeThrowAction |
  GetAction | GetReturnAction | GetThrowAction |
  SetAction | SetReturnAction | SetThrowAction


export type ConstructAction = {
  type: 'construct',
  id: string,
  payload: any[],
}

export type InvokeAction = {
  type: 'invoke',
  id: string
  payload: any[],
}

export type InvokeReturnAction = {
  type: 'invoke-return',
  id: string
  payload: any,
}

export type InvokeThrowAction = {
  type: 'invoke-throw',
  id: string
  payload: any,
}

export type GetAction = {
  type: 'get',
  id: string
  payload: string | number,
}

export type GetReturnAction = {
  type: 'get-return',
  id: string,
  payload: [string | number, any]
}

export type GetThrowAction = {
  type: 'get-throw',
  id: string,
  payload: [string | number, any]
}

export type SetAction = {
  type: 'set',
  id: string,
  payload: [string | number, any]
}

export type SetReturnAction = {
  type: 'set-return',
  id: string,
  payload: [string | number, any, any]
}

export type SetThrowAction = {
  type: 'set-throw',
  id: string,
  payload: [string | number, any, any]
}
