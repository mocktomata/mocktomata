import { SpecStore } from './specStore';

export function getReturnStub(type) {
  if (type === 'promise') {
    return promiseStub
  }
  if (type === 'childProcess')
    return childProcessStub
}

function promiseStub({ store, resolve }: { store: SpecStore, resolve: any }) {
  const action = store.peek()
  if (action.type === 'promise') {
    store.next()
    resolve()
    if (action.meta.type === 'resolve')
      return Promise.resolve(action.payload)
    else
      return Promise.reject(action.payload)
  }
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

