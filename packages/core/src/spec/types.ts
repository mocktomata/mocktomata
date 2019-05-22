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
  /**
   * Indicate is this a spec subject.
   * For class, multiple instances of the subject can be created.
   */
  isSubject?: true
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
  payload: any[],
  id: string,
}

export type InvokeAction = {
  type: 'invoke',
  payload: any[],
  id: string
}

export type ReturnAction = {
  type: 'return',
  payload: any,
  id: string
}

export type ThrowAction = {
  type: 'throw',
  payload: any,
  id: string
}

export type GetAction = {
  type: 'get',
  payload: string | number,
  id: string
}

export type SetAction = {
  type: 'set',
  payload: [string | number, any],
  id: string
}
