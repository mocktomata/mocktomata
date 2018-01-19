// @ts-ignore
import { FluxStandardAction } from 'flux-standard-action'
import { io } from './io'
import { SpecRecord } from './interfaces'
import { spy, Spy } from './spy'

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

function locateCallback(args, callbackPath) {
  if (callbackPath) {
    return callbackPath.reduce((p, v) => {
      return p[v]
    }, args)
  }
  return args.find(arg => typeof arg === 'function')
}

function stubFunction({ resolve, events, listenAll }, subject, id: string, actions: FluxStandardAction<any, any>[]) {
  let i = 0
  function getAction() {
    const action = actions[i++]
    if (events[action.type]) {
      events[action.type].forEach(cb => cb(action))
    }
    if (listenAll.length > 0) {
      listenAll.forEach(cb => cb(action))
    }
    return action
  }

  let spied
  return function (...args) {
    if (spied)
      return spied.subject.call(this, ...args)

    const inputAction = getAction()

    if (!inputMatches(inputAction.payload, args)) {
      if (!spied) {
        console.warn(`Calling input does not match with saved record of spec '${id}'. Run in 'verify' mode instead.`)
        spied = spy(subject)
        spied.closing.then(spiedActions => {
          actions.splice(0, actions.length, ...spiedActions)
          resolve()
        })
      }
      return spied.subject.call(this, ...args)
    }

    const result = processUntilReturn()
    if (i >= actions.length) {
      resolve()
    }
    return result

    function processUntilReturn() {
      const action = getAction()
      if (action.type === 'return') {
        if (action.meta) {
          if (action.meta.type === 'promise') {
            if (action.meta.meta === 'resolve')
              return Promise.resolve(action.payload)
            else
              return Promise.reject(action.payload)
          }
        }
        return action.payload
      }
      if (action.type === 'invoke') {
        return undefined
      }
      if (action.type === 'callback') {
        const callback = locateCallback(args, action.meta)
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


export async function stub<T>(subject: T, id): Promise<Spy<T>> {
  let specRecord: SpecRecord
  try {
    specRecord = await io.readSpec(id)
  }
  catch {
    /* istanbul ignore next */ {
      console.warn(`Cannot find saved record for spec '${id}'. Run in 'verify' mode instead.`)
      return spy(subject)
    }
  }

  const events = {}
  const listenAll: any[] = []
  function on(event, callback) {
    if (!events[event])
      events[event] = []
    events[event].push(callback)
  }
  function onAny(callback) {
    listenAll.push(callback)
  }
  let resolve
  const closing = new Promise<FluxStandardAction<any, any>[]>(a => {
    resolve = () => {
      a(specRecord.actions)
    }
  })

  const stubbed = stubFunction({ resolve, events, listenAll }, subject, id, specRecord.actions)

  return {
    on,
    onAny,
    actions: specRecord.actions,
    closing,
    subject: stubbed
  } as any
}
