import { SpecContext, SpecPluginUtil } from '../index';

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
  if (!meta) {
    return args.find(arg => typeof arg === 'function')
  }
  if (Array.isArray(meta))
    return meta.reduce((p, v) => {
      return p[v]
    }, args)
  else if (meta.site) {
    if (typeof meta.site[0] === 'number') {
      return meta.site.reduce((p, v) => {
        return p[v]
      }, args)
    }
  }
}

export function stubFunction(context: SpecContext, komondor: SpecPluginUtil, subject, id: string) {
  let spied
  return function (...args) {
    if (spied)
      return spied.call(this, ...args)

    const inputAction = context.peek()

    if (!inputAction || !inputMatches(inputAction.payload, args)) {
      if (!spied) {
        komondor.log.warn(`Calling input does not match with saved record of spec '${id}'. Run in 'verify' mode instead.`)
        context.prune()
        spied = komondor.getSpy(context, subject)
      }
      return spied.call(this, ...args)
    }
    context.next()

    const result = processUntilReturn()
    if (context.peek() === undefined) {
      context.complete()
    }
    return result

    function processUntilReturn() {
      const action = context.next()
      if (!action) return undefined

      if (action.type === 'return') {
        if (action.meta) {
          const returnStub = komondor.getReturnStub(context, action.meta.type)
          if (returnStub)
            return returnStub
        }
        return action.payload
      }
      if (action.type === 'invoke') {
        return undefined
      }
      if (action.type === 'callback') {
        const callback = locateCallback(action.meta, args)
        callback(...action.payload)
      }
      if (action.type === 'throw') {
        context.complete()
        throw action.payload
      }
      return processUntilReturn()
    }
  }
}
