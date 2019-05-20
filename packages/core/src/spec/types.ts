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
  /**
   * `target` is the spy or stub of the subject.
   */
  target: any,
  ref: string
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

export type SpecAction = ConstructAction | InvokeAction | GetAction | SetAction |
  ReturnAction | ThrowAction

export type ConstructAction = {
  type: 'construct',
  payload: any[] | undefined,
  ref: string,
}

export type InvokeAction = {
  type: 'invoke',
  payload: any[] | undefined,
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
