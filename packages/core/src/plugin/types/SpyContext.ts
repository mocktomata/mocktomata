import { Meta } from '../../spec';

export type SpyContext = { recorder: SpyRecorder }

export type SpyRecorder = {
  /**
   * Declare a new spy.
   */
  declare(spy: any): SpySubjectRecorder,
  getSpy<T>(subject: T): T
}

export type SpySubjectRecorder = {
  instantiate(args: any[]): SpyInstanceRecorder,
  invoke(args: any[]): SpyInvocationRecorder
} & SpyInstanceRecorder

export type SpyInstanceRecorder = {
  get(name: string | number): SpyInvocationRecorder,
  set(name: string | number, value: any): SpyInvocationRecorder,
}

export type SpyInvocationRecorder = {
  returns<T>(value: T, meta?: Meta): T,
  throws<T>(err: T, meta?: Meta): T
}

