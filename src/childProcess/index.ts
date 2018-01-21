import { SpecStore } from '../specStore'

export function getReturnSpy({ resolve, store }, subject) {
  if (!isChildProcess(subject)) return undefined
  return spyChildProcess({ resolve, store }, subject)
}

export function getReturnStub({ store, resolve }: { store: SpecStore, resolve: any }, type: string) {
  if (type !== 'childProcess') return undefined
  return childProcessStub({ store, resolve })
}


function isChildProcess(result) {
  return typeof result.on === 'function' &&
    result.stdout && typeof result.stdout.on === 'function' &&
    result.stderr && typeof result.stderr.on === 'function'
}

function spyOnListener({ store, resolve }, type, base, site: string[], terminateEvent?: string) {
  const subject = site.reduce((p, v, i) => {
    if (i === site.length - 1)
      return p
    return p[v]
  }, base)
  const methodName = site[site.length - 1]
  const fn = subject[methodName]
  subject[methodName] = function (event, cb) {
    const wrap = (...args) => {
      store.add({
        type,
        payload: args,
        meta: {
          site,
          event
        }
      })
      cb(...args)
      if (terminateEvent === event)
        resolve()
    }
    return fn.call(subject, event, wrap)
  }

}

function spyChildProcess({ store, resolve }, subject) {
  store.add({
    type: 'return',
    payload: {},
    meta: { type: 'childProcess' }
  })
  spyOnListener({ store, resolve }, 'childProcess', subject, ['on'], 'close')
  spyOnListener({ store, resolve }, 'childProcess', subject, ['stdout', 'on'])
  spyOnListener({ store, resolve }, 'childProcess', subject, ['stderr', 'on'])
  return subject
}

function childProcessStub({ store, resolve }: { store: SpecStore, resolve: any }) {
  const on = {}
  const stdout = {}
  const stderr = {}
  setImmediate(() => {
    processUntilCloseEvent({ store, on, stdout, stderr })
    resolve()
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

function processUntilCloseEvent({ store, on, stdout, stderr }) {
  const action = store.peek()
  if (action === undefined) {
    return
  }
  if (action.type !== 'childProcess')
    return

  const site = action.meta.site.join('.')
  let target
  switch (site) {
    case 'on':
      target = on
      break
    case 'stdout.on':
      target = stdout
      break
    case 'stderr.on':
      target = stderr
      break
  }

  target[action.meta.event].forEach(cb => cb(...action.payload))

  store.next()
  processUntilCloseEvent({ store, on, stdout, stderr })
}

