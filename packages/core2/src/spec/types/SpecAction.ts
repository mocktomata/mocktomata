import { Meta } from './Meta';
import { ReferenceId } from './SpecReference';

export type ActionId = number

/**
 * Key types that works with `komondor`.
 * Note that `symbol` is not supported.
 */
export type SupportedKeyTypes = string | number

export type SpecAction = InvokeAction | InstantiateAction | GetAction | ReturnAction | ThrowAction

export type InstantiateAction = {
  type: 'instantiate',
  ref: ReferenceId,
  tick: number,
  payload: any[],
  meta?: Meta
}

export type InvokeAction = {
  type: 'invoke',
  ref: ReferenceId | ActionId,
  tick: number,
  payload: any[],
  meta?: Meta
}

export type ReturnAction = {
  type: 'return',
  ref: ActionId,
  tick: number,
  payload: any,
  meta?: Meta,
}

export type ThrowAction = {
  type: 'throw',
  ref: ActionId,
  tick: number,
  payload: any,
  meta?: Meta,
}

export type GetAction = {
  type: 'get',
  ref: ReferenceId | ActionId,
  tick: number,
  payload: SupportedKeyTypes,
}

export type SetAction = {
  type: 'set',
  ref: ReferenceId | ActionId,
  tick: number,
  payload: [SupportedKeyTypes, any]
}
