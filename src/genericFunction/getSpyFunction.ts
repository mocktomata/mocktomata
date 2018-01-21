function spyOnCallback(fn, callbackPath) {
  let callback
  return Object.assign(
    (...args) => {
      callback(callbackPath, ...args)
      fn(...args)
    }, {
      called(cb) {
        callback = cb
      }
    })
}

export function spyFunction(context, subject) {
  const { store, resolve, komondor } = context

  return function (...args) {
    store.add({
      type: 'invoke',
      payload: args
    })
    const spiedCallbacks: any[] = []
    const spiedArgs = args.map((arg, index) => {
      if (typeof arg === 'function') {
        const spied = spyOnCallback(arg, undefined)
        spiedCallbacks.push(spied)
        return spied
      }
      if (typeof arg === 'object') {
        Object.keys(arg).forEach(key => {
          if (typeof arg[key] === 'function') {
            const spied = spyOnCallback(arg[key], [index, key])
            spiedCallbacks.push(spied)
            arg[key] = spied
          }
        })
      }
      return arg
    })
    if (spiedCallbacks.length > 0) {
      const waiting = new Promise(a => {
        spiedCallbacks.forEach(s => {
          s.called((callbackPath, ...results) => {
            store.add({
              type: 'callback',
              payload: results,
              meta: callbackPath
            })
            a()
          })
        })
      })
      const result = subject.call(this, ...spiedArgs)
      waiting.then(() => {
        store.add({
          type: 'return',
          payload: result
        })
        resolve()
      }, resolve)
      return result
    }
    else {
      let result
      try {
        result = subject.call(this, ...args)
      }
      catch (err) {
        store.add({
          type: 'throw',
          payload: err
        })
        // resolve instead of reject because it is the call that fails,
        // the spying didn't fail.
        resolve()
        throw err
      }
      const returnSpy = komondor.getReturnSpy({ store, resolve }, result)
      if (returnSpy) {
        return returnSpy
      }
      else {
        store.add({ type: 'return', payload: result })
        resolve()
      }
      return result
    }
  }
}
