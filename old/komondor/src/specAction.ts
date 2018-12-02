import { SpecAction } from 'komondor-plugin'
import { createSatisfier } from 'satisfier'

import { artifactKey } from './constants'
import { plugins } from './plugin'

export function isMismatchAction(actual: SpecAction, expected: SpecAction) {
  return !createSatisfier(createActionExpectation(expected)).test(actual)
}

function createActionExpectation(action: SpecAction) {
  return {
    ...action,
    payload: createExpectationValue(action.payload)
  }
}

function createExpectationValue(value) {
  if (value === null) return undefined
  if (Array.isArray(value)) return value.map(v => createExpectationValue(v))
  if (typeof value === 'object') {
    return Object.keys(value).reduce((p, k) => {
      p[k] = createExpectationValue(p[k])
      return p
    }, {})
  }
  return value
}

export function makeSerializableActions(actions: SpecAction[]) {
  return actions.map(makeSerializableAction)
}

export function makeSerializableAction(action: SpecAction) {
  const objRefs = []
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
function serializeEntry(value, objRefs: object[]) {
  if (value === undefined || value === null) return value
  if (value[artifactKey]) return value
  if (Array.isArray(value)) return value.map(v => serializeEntry(v, objRefs))
  if (typeof value === 'object') {
    const cirId = objRefs.findIndex(x => x === value)
    if (cirId >= 0) {
      return `[circular:${cirId}]`
    }
  }

  const plugin = plugins.find(p => p.support(value))
  if (plugin && plugin.serialize) {
    const val = plugin.serialize(value)
    objRefs.push(val)
    return val
  }

  if (typeof value === 'object') {
    objRefs.push(value)
    return Object.keys(value).reduce((p, key) => {
      p[key] = serializeEntry(value[key], objRefs)
      return p
    }, {})
  }
  return value
}
