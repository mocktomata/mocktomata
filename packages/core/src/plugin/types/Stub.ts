import { KeyTypes } from 'type-plus';
import { Meta } from '../../spec';

export type StubContext = {
  newStubRecorder(stub?: any, meta?: Meta): StubPlayer
}

export type StubPlayer = {
  construct(args?: any[]): any,
  invoke(args?: any[]): StubInvokeRecorder,
  get(prop: KeyTypes): any,
  set(prop: KeyTypes, value: any): any,
}

export type StubInvokeRecorder = {
  succeed(): boolean,
  return(): any,
  throw(): any,
}
