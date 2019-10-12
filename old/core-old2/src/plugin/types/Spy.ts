import { KeyTypes } from 'type-plus';
import { Meta } from '../../spec';

export type SpyContext = {
  newSpyRecorder<M extends Meta | undefined = undefined>(spy: any, meta?: M): SpyRecorder<M>
}

export type SpyRecorder<M extends Meta | undefined> = {
  meta: M,
  construct(args?: any[]): any,
  invoke<M2>(args?: any[], meta?: M2): SpyInvokeRecorder<M2>,
  get(prop: KeyTypes): any,
  set(prop: KeyTypes, value: any): any,
}

export type SpyInvokeRecorder<M extends Meta | undefined> = {
  meta: M,
  spiedArgs: any[],
  return<R>(result: R): R,
  throw<E>(error: E): E
}
