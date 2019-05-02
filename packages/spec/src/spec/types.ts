import { RequiredPick } from 'type-plus';

export type SpecMode = 'auto' | 'live' | 'save' | 'simulate'

export type Spec<T> = {
  subject: T,
  done(): Promise<void>
}

/**
 * Meta data of the action.
 * Save information about the action during spying,
 * so that it can be used during stubbing to replay the behavior.
 */
export type Meta = Record<string, any>

export type SpecRecord = { actions: SpecAction[] }

export type SpecIO = {
  readSpec(id: string): Promise<SpecRecord>,
  writeSpec(id: string, record: SpecRecord): Promise<void>
}

export type SpecOptions = {
  timeout: number
}

export type SpecAction = ConstructAction | InvokeAction | GetAction | SetAction |
  ReturnAction | ThrowAction | CallbackConstructAction

export type SpecActionInternal = ConstructActionInternal

export type ConstructActionInternal = ConstructAction & {
  plugin: string,
  instanceId: number
}


export type SubjectInfo = {
  plugin: string,
  subjectId: number,
  instanceId?: number,
  invokeId?: number
}

export type SourceInfo = SourceArgumentInfo | SourceReturnInfo | SourceThrowInfo | SourceYieldInfo

export type SourceArgumentInfo = SubjectInfo & {
  type: 'argument'
  /**
   * When used as source info, not defined site means the subject is a return value.
   */
  site?: (string | number)[]
}

export type SourceReturnInfo = SubjectInfo & {
  type: 'return'
}

export type SourceThrowInfo = SubjectInfo & {
  type: 'throw'
}

export type SourceYieldInfo = SubjectInfo & {
  type: 'yield'
}

export type SpecActionBase<SUB = SubjectInfo> = {
  subject: SUB,
  source?: SourceInfo
  payload: any,
  meta?: Meta | undefined
}

export type ConstructAction = {
  name: 'construct'
} & SpecActionBase

export type InvokeAction = {
  name: 'invoke'
} & SpecActionBase<RequiredPick<SubjectInfo, 'invokeId'>>

export type ReturnAction = {
  name: 'return',
  returnPlugin?: string,
  returnInstanceId?: number
} & SpecActionBase<RequiredPick<SubjectInfo, 'invokeId'>>

export type CallbackConstructAction = {
  name: 'construct-callback',
  plugin: string,
  payload: any[],
  meta?: Meta,
  subjectId: number,
  instanceId: number
  sourceType: string;
  sourceInstanceId: number;
  sourceInvokeId: number;
  sourceSite: (string | number)[];
}

export type ThrowAction = {
  name: 'throw',
  throwPlugin?: string,
  throwInstanceId?: number
} & SpecActionBase<RequiredPick<SubjectInfo, 'invokeId'>>

export type GetAction = {
  name: 'get'
} & SpecActionBase<RequiredPick<SubjectInfo, 'invokeId'>>

export type SetAction = {
  name: 'set',
} & SpecActionBase<RequiredPick<SubjectInfo, 'invokeId'>>
