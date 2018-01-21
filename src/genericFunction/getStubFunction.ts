import { SpecStore } from '../specStore'
import { getReturnStub } from '../returnStubs'
import { log } from '../log'
import { spy } from '../spy'


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

export function stubFunction({ resolve, store }: { resolve: any, store: SpecStore }, subject, id: string) {

  let spied
  return function (...args) {
    if (spied)
      return spied.subject.call(this, ...args)

    const inputAction = store.peek()

    if (!inputMatches(inputAction.payload, args)) {
      if (!spied) {
        log.warn(`Calling input does not match with saved record of spec '${id}'. Run in 'verify' mode instead.`)
        spied = spy(subject)
        spied.completed.then(spiedActions => {
          store.graft(...spiedActions)
          resolve()
        })
      }
      return spied.subject.call(this, ...args)
    }
    store.next()

    const result = processUntilReturn()
    if (store.peek() === undefined) {
      resolve()
    }
    return result

    function processUntilReturn() {
      const action = store.next()
      if (action.type === 'return') {
        if (action.meta) {
          const returnStub = getReturnStub(action.meta.type)
          if (returnStub)
            return returnStub({ store, resolve })
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
        resolve()
        throw action.payload
      }
      return processUntilReturn()
    }
  }
}
