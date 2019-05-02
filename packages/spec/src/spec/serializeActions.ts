import { SpecAction } from './types';
import { reduceKey, KeyTypes } from 'type-plus';
import { findPlugin } from '../plugin';

export function serializeActions(actions: SpecAction[]) {
  return actions.map(serializeAction)
}

function serializeAction(action: SpecAction) {
  const objRefs: (string | number | boolean | null)[] = []
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

function serializeEntry(value: any, objRefs: (string | number | boolean | null)[]): any {
  if (value === undefined || value === null) return value
  // if (value[artifactKey]) return value
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
    return reduceKey(value, (p, key: any) => {
      p[key] = serializeEntry(value[key], objRefs)
      return p
    }, {} as Record<KeyTypes, any>)
  }
  return value
}
