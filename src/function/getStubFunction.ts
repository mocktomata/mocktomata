import { SimulationMismatch, StubContext } from 'komondor-plugin'

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
  if (!meta.sourcePath) {
    return args.find(arg => typeof arg === 'function')
  }

  return meta.sourcePath.reduce((p, v) => {
    return p[v]
  }, args)
}

export function stubFunction(context: StubContext) {
  let currentId = 0
  return function (...args) {
    const inputAction = context.peek()
    console.log('peek', inputAction)
    if (!inputAction || !inputMatches(inputAction.payload, args)) {
      throw new SimulationMismatch(context.specId, { type: 'function/invoke', payload: args }, inputAction)
    }
    currentId = Math.max(currentId, inputAction.meta.id)
    context.next()
    const result = processUntilReturn()

    process.nextTick(() => {
      let action = context.peek()
      while (action && action.meta.id <= currentId) {
        context.next()
        if (action.type === 'function/invoke') {
          const callback = locateCallback(action.meta, args)
          callback(...action.payload)
        }
        action = context.peek()
      }
    })
    return result
    function processUntilReturn() {
      const action = context.peek()
      console.log('action', action, args)
      if (!action) return undefined
      if (action.meta.id > currentId) return undefined

      if (action.type === 'function/return') {
        const result = action.meta && context.getStub(context, action) || action.payload
        console.log('return', result)
        context.next()
        return result
      }

      context.next()
      if (action.type === 'function/invoke') {
        const callback = locateCallback(action.meta, args)
        console.log(callback)
        callback(...action.payload)
      }

      if (action.type === 'function/throw') {
        throw action.payload
      }
      return processUntilReturn()
    }
  }
}
