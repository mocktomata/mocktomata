import { SpecContext, SpecPluginUtil } from '../interfaces'
import { SimulationMismatch } from '..';

function inputMatches(a, b: any[]) {
  // istanbul ignore next
  if (b.length !== a.length)
    return false
  let match = true
  for (let i = 0; i < b.length; i++) {
    const value = b[i]
    const valueType = typeof value
    if (valueType === 'function') continue
    if (valueType === 'object') {
      // istanbul ignore next
      if (typeof a !== 'object') {
        match = false
        break
      }

      const va = a[i]
      match = !Object.keys(value).some(k => {
        if (typeof value[k] === 'function') return false
        return value[k] !== va[k]
      })
      if (!match)
        break;
    }
    else if (b[i] !== a[i]) {
      match = false
      break;
    }
  }
  return match
}

function locateCallback(meta, args) {
  if (!meta.callbackPath) {
    return args.find(arg => typeof arg === 'function')
  }

  return meta.callbackPath.reduce((p, v) => {
    return p[v]
  }, args)
}

export function stubFunction(context: SpecContext, komondor: SpecPluginUtil, _subject, id: string) {
  let currentId = 0
  return function (...args) {
    const inputAction = context.peek()
    if (!inputAction || !inputMatches(inputAction.payload, args)) {
      throw new SimulationMismatch(id, { type: 'fn/invoke', payload: args }, inputAction)
    }
    currentId = Math.max(currentId, inputAction.meta.functionId)
    context.next()
    const result = processUntilReturn()

    process.nextTick(() => {
      let action = context.peek()
      while (action && action.meta.functionId <= currentId) {
        context.next()
        if (action.type === 'fn/callback') {
          const callback = locateCallback(action.meta, args)
          callback(...action.payload)
        }
        action = context.peek()
      }
    })
    return result
    function processUntilReturn() {
      const action = context.peek()
      if (!action) return undefined
      if (action.meta.functionId > currentId) return undefined

      if (action.type === 'fn/return') {
        const result = action.meta && komondor.getReturnStub(context, action) || action.payload
        context.next()
        return result
      }

      context.next()
      if (action.type === 'fn/callback') {
        const callback = locateCallback(action.meta, args)
        callback(...action.payload)
      }

      if (action.type === 'fn/throw') {
        throw action.payload
      }
      return processUntilReturn()
    }
  }
}
