import { KeyTypes } from 'type-plus';
import { Meta } from '../../spec';

export type ReplayerContext = {
  newReplayer(stub?: any, meta?: Meta): Replayer
}

export type Replayer = {
  construct(args?: any[]): any,
  invoke(args?: any[]): ReplayInvokeRecorder,
  get(prop: KeyTypes): any,
  set(prop: KeyTypes, value: any): any,
  on(type: string, handler: any): void
}

export type ReplayInvokeRecorder = {
  succeed(): boolean,
  return(): any,
  throw(): any,
}
