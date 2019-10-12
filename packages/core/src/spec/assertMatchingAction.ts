import { createSatisfier } from 'satisfier';
import { artifactKey } from './constants';
import { ActionMismatch } from './errors';
import { SpecAction, SpecActionBase, SpecRecord } from './types';
import { getRef } from './mockRecordFns';

export function assertMatchingAction(id: string, received: SpecRecord, actual: SpecActionBase, expected: SpecActionBase) {
  if (!isMismatchAction(actual, expected)) {
    const aplugin = getRef(received, actual.ref)!.plugin
    const eplugin = getRef(received, expected.ref)!.plugin
    throw new ActionMismatch(id, { ...actual, plugin: aplugin }, { ...expected, plugin: eplugin })
  }
}

function isMismatchAction(actual: SpecActionBase, expected: SpecActionBase) {
  return !createSatisfier(createActionExpectation(expected)).test(actual)
}

function createActionExpectation(action: SpecActionBase) {
  return {
    ...action,
    payload: createExpectationValue(action.payload)
  }
}

function createExpectationValue(value: any): any {
  if (value === null) return undefined
  if (Array.isArray(value)) return value.map(v => createExpectationValue(v))
  if (typeof value === 'object') {
    return Object.keys(value).reduce((p, k) => {
      p[k] = createExpectationValue(p[k])
      return p
    }, {} as Record<any, any>)
  }
  return value
}

export function makeSerializableActions(actions: SpecAction[]) {
  return actions.map(makeSerializableAction)
}

export function makeSerializableAction(action: SpecAction) {
  const objRefs: object[] = []
  if (action.payload) {
    if (action.payload instanceof Error) {
      // TODO: use `iso-error`
      return {
        ...action,
        payload: {
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
  }
  return action
}

/**
 * NOTE: maybe can replace this with tersify()
 */
function serializeEntry(value: any, objRefs: object[]): any {
  if (value === undefined || value === null) return value
  if (value[artifactKey]) return value
  if (Array.isArray(value)) return value.map(v => serializeEntry(v, objRefs))
  if (typeof value === 'object') {
    const cirId = objRefs.findIndex(x => x === value)
    if (cirId >= 0) return `[circular:${cirId}]`

    objRefs.push(value)
    return Object.keys(value).reduce((p, key) => {
      p[key] = serializeEntry(value[key], objRefs)
      return p
    }, {} as any)
  }
  return value
}
