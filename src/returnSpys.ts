
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
function isPromise(result) {
  return result && typeof result.then === 'function' && typeof result.catch === 'function'
}
function spyOnPromise({ store, resolve }, result) {
  store.add({
    type: 'return',
    payload: {},
    meta: { type: 'promise' }
  })
  result.then(
    results => ({ type: 'promise', payload: results, meta: { type: 'resolve' } }),
    err => ({ type: 'promise', payload: err, meta: { type: 'reject' } })
  ).then(action => {
    store.add(action)
  }).then(() => resolve())
  return result
}
export function getReturnSpy(result) {
  if (isPromise(result))
    return spyOnPromise
  if (isChildProcess(result))
    return spyChildProcess
  return undefined
}
