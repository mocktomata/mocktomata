import { findPlugin } from '@mocktomata/plugin';
import { createSatisfier } from 'satisfier';
import { reduceKey } from 'type-plus';
import { artifactKey } from './constants';
import { Meta } from './interfaces';

// export interface SpecActionOld {
//   type: string;
//   name: string;
//   payload: any;
//   meta?: Meta,
//   // instance id is optional because komondor/callback action does not have instanceId
//   instanceId?: number,
//   invokeId?: number,
//   sourceType?: string,
//   sourceInstanceId?: number,
//   sourceInvokeId?: number,
//   sourceSite?: (string | number)[],
//   returnType?: string,
//   returnInstanceId?: number
// }

export type SpecAction = ConstructAction | InvokeAction | ReturnAction | ThrowAction | CallbackConstructAction

export type ConstructAction = {
  name: 'construct',
  plugin: string,
  payload: any[] | undefined,
  meta?: Meta,
  instanceId: number
}

export type InvokeAction = {
  name: 'invoke',
  plugin: string,
  payload: any[],
  meta?: Meta,
  instanceId: number,
  invokeId: number
}

export type ReturnAction = {
  name: 'return',
  plugin: string,
  payload: any,
  meta?: Meta,
  instanceId: number,
  invokeId: number,
  returnType: string,
  returnInstanceId: number
}

export type CallbackConstructAction = {
  name: 'construct-callback',
  plugin: string,
  payload: any[],
  meta?: Meta,
  // TODO validate: instance id is optional because komondor/callback action does not have instanceId
  instanceId: number
  sourceType: string;
  sourceInstanceId: number;
  sourceInvokeId: number;
  sourceSite: (string | number)[];
}

export type ThrowAction = {
  name: 'throw',
  plugin: string,
  payload: any,
  meta?: Meta,
  instanceId: number,
  invokeId: number
}

// export interface SpecActionWithSource extends SpecAction {
//   sourceType: string;
//   sourceInstanceId: number;
//   sourceInvokeId: number;
//   sourceSite: (string | number)[];
// }

export function isMismatchAction(actual: Partial<SpecAction>, expected: Partial<SpecAction>) {
  return !createSatisfier(createActionExpectation(expected)).test(actual)
}

function createActionExpectation(action: Partial<SpecAction>) {
  return {
    ...action,
    payload: createExpectationValue(action.payload)
  }
}

function createExpectationValue(value: any): any {
  if (value === null) return undefined
  if (Array.isArray(value)) return value.map(v => createExpectationValue(v))
  if (typeof value === 'object') {
    return reduceKey<typeof value, Record<string, any>>(value, (p, k) => {
      p[k] = createExpectationValue(p[k])
      return p
    }, {})
  }
  return value
}

export function makeSerializableActions(actions: SpecAction[]) {
  return actions.map(makeSerializableAction)
}

export function makeSerializableAction(action: Pick<SpecAction, 'payload'>) {
  const objRefs: any = []
  if (action.payload) {
    if (action.payload instanceof Error) {
      return {
        ...action, payload: {
          message: action.payload.message,
          ...action.payload,
          prototype: 'Error'
        }
      }
    }
    else {
      return {
        ...action,
        payload: serializeEntry(action.payload, objRefs)
      }
    }
    // else if (action.name === 'invoke') {
    //   const args: any[] = action.payload
    //   return {
    //     ...action,
    //     payload: args.map(arg => serializeEntry(arg, objRefs))
    //   }
    // }
  }
  return action
}
function serializeEntry(value: any, objRefs: any[]): any {
  if (value === undefined || value === null) return value
  if (value[artifactKey]) return value
  if (Array.isArray(value)) return value.map(v => serializeEntry(v, objRefs))
  if (typeof value === 'object') {
    const cirId = objRefs.findIndex(x => x === value)
    if (cirId >= 0) {
      return `[circular:${cirId}]`
    }
  }

  const plugin = findPlugin(value)
  if (plugin && plugin.serialize) {
    const val = plugin.serialize(value)
    objRefs.push(val)
    return val
  }

  if (typeof value === 'object') {
    objRefs.push(value)
    return Object.keys(value).reduce<any>((p, key) => {
      p[key] = serializeEntry(value[key], objRefs)
      return p
    }, {})
  }
  return value
}
