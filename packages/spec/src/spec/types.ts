import { RequiredPick } from 'type-plus';
import { KomondorPlugin } from '../types';

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
  ReturnAction | ThrowAction

export type SpecActionInternal = ConstructActionInternal

export type ConstructActionInternal = ConstructAction & {
  plugin: string,
  instanceId: number
}


export type SubjectInfo = {
  plugin: KomondorPlugin,
  subjectId: number,
  instanceId?: number,
  invokeId?: number,
  meta?: Meta
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
  subjectInfo: SUB,
  sourceInfo?: SourceInfo
  payload: any,
  meta?: Meta | undefined
}

export type ConstructAction = {
  type: 'construct'
} & SpecActionBase

export type InvokeAction = {
  type: 'invoke'
} & SpecActionBase<RequiredPick<SubjectInfo, 'invokeId'>>

export type ReturnAction = {
  type: 'return',
  returnPlugin?: string,
  returnInstanceId?: number
} & SpecActionBase<RequiredPick<SubjectInfo, 'invokeId'>>

// export type CallbackConstructAction = {
//   name: 'construct-callback',
//   plugin: string,
//   payload: any[],
//   meta?: Meta,
//   subjectId: number,
//   instanceId: number
//   sourceType: string;
//   sourceInstanceId: number;
//   sourceInvokeId: number;
//   sourceSite: (string | number)[];
// }

export type ThrowAction = {
  type: 'throw',
  throwPlugin?: string,
  throwInstanceId?: number
} & SpecActionBase<RequiredPick<SubjectInfo, 'invokeId'>>

export type GetAction = {
  type: 'get'
} & SpecActionBase<RequiredPick<SubjectInfo, 'invokeId'>>

export type SetAction = {
  type: 'set'
} & SpecActionBase<RequiredPick<SubjectInfo, 'invokeId'>>
