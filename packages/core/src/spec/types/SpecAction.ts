export type ReferenceId = string | number

export type SpecAction = InstantiateAction | InvokeAction | GetAction | SetAction |
  ReturnAction | ThrowAction

export type InstantiateAction = {
  type: 'instantiate',
  ref: string,
  tick: number,
  payload: any[],
}

export type InvokeAction = {
  type: 'invoke',
  ref: ReferenceId,
  tick: number,
  payload: any[],
}

export type ReturnAction = {
  type: 'return',
  ref: number,
  tick: number,
  payload: any,
  meta?: Meta,
}

export type ThrowAction = {
  type: 'throw',
  ref: number,
  tick: number,
  payload: any,
  meta?: Meta,
}

export type GetAction = {
  type: 'get',
  ref: ReferenceId,
  tick: number,
  payload: string | number,
}

export type SetAction = {
  type: 'set',
  ref: ReferenceId,
  tick: number,
  payload: [string | number, any]
}

/**
 * Meta data of the action.
 * Save information about the action during spying,
 * so that it can be used during stubbing to replay the behavior.
 */
export type Meta = Record<string, any>
