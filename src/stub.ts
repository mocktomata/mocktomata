import { FluxStandardAction } from 'flux-standard-action'

import { log } from './log'
import { createSpecStore, SpecStore } from './specStore'
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

function stubFunction({ resolve, store }: { resolve: any, store: SpecStore }, subject, id: string) {

  let spied
  return function (...args) {
    if (spied)
      return spied.subject.call(this, ...args)

    const inputAction = store.peek()

    if (!inputMatches(inputAction.payload, args)) {
      if (!spied) {
        log.warn(`Calling input does not match with saved record of spec '${id}'. Run in 'verify' mode instead.`)
        spied = spy(subject)
        spied.closing.then(spiedActions => {
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

    function promiseStub(action) {
      if (action.meta.meta === 'resolve')
        return Promise.resolve(action.payload)
      else
        return Promise.reject(action.payload)
    }

    function processUntilCloseEvent({ on, stdout, stderr }) {
      const action = store.peek()
      if (action === undefined) {
        resolve()
        return
      }
      if (action.type !== 'callback') {
        // istanbul ignore next
        throw new Error('not supported. childProcess stub processing non-callback')
      }

      const site = action.meta.site.join('.')
      let target
      switch (site) {
        case 'return.on':
          target = on
          break
        case 'return.stdout.on':
          target = stdout
          break
        case 'return.stderr.on':
          target = stderr
          break
      }
      if (!target) {
        // istanbul ignore next
        throw new Error(`unknown callback site: ${site}`)
      }

      target[action.meta.event].forEach(cb => cb(...action.payload))

      store.next()
      processUntilCloseEvent({ on, stdout, stderr })
    }
    function childProcessStub() {
      const on = {}
      const stdout = {}
      const stderr = {}
      setImmediate(() => {
        processUntilCloseEvent({ on, stdout, stderr })
      })
      return {
        on(event, callback) {
          if (!on[event])
            on[event] = []
          on[event].push(callback)
        },
        stdout: {
          on(event, callback) {
            if (!stdout[event])
              stdout[event] = []
            stdout[event].push(callback)
          }
        },
        stderr: {
          on(event, callback) {
            if (!stderr[event])
              stderr[event] = []
            stderr[event].push(callback)
          }
        }
      }
    }

    function processUntilReturn() {
      const action = store.next()
      if (action.type === 'return') {
        if (action.meta) {
          if (action.meta.type === 'promise') {
            return promiseStub(action)
          }
          if (action.meta.type === 'childProcess') {
            return childProcessStub()
          }
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


export async function stub<T>(subject: T, id): Promise<Spy<T>> {
  const store = createSpecStore()
  await store.load(id)

  let resolve
  const closing = new Promise<FluxStandardAction<any, any>[]>(a => {
    resolve = () => {
      a(store.actions)
    }
  })


  const stubbed = stubFunction({ resolve, store }, subject, id)

  return {
    on: store.on,
    onAny: store.onAny,
    actions: store.actions,
    closing,
    subject: stubbed
  } as any
}
