import { SpecContext, ReturnAction, KomondorRegistrar } from '../index'

export function activate(registrar: KomondorRegistrar) {
  registrar.registerGetReturnSpy(getReturnSpy)
  registrar.registerGetReturnStub(getReturnStub)
}

function getReturnSpy(context: SpecContext, subject, action: ReturnAction) {
  if (!isChildProcess(subject)) return undefined
  return spyChildProcess(context, subject, action)
}

function getReturnStub(context: SpecContext, action: ReturnAction) {
  if (action.meta.returnType !== 'childProcess') return undefined
  return stubChildProcess(context)
}

function isChildProcess(result) {
  return result && typeof result.on === 'function' &&
    result.stdout && typeof result.stdout.on === 'function' &&
    result.stderr && typeof result.stderr.on === 'function'
}

function spyOnListener(context: SpecContext, type: string, base, site: string[]) {
  const subject = site.reduce((p, v, i) => {
    if (i === site.length - 1)
      return p
    return p[v]
  }, base)
  const methodName = site[site.length - 1]
  const fn = subject[methodName]
  subject[methodName] = function (event, cb) {
    const wrap = (...args) => {
      context.add({
        type,
        payload: args,
        meta: {
          site,
          event
        }
      })
      cb(...args)
    }
    return fn.call(subject, event, wrap)
  }

}

function spyChildProcess(context: SpecContext, subject, action: ReturnAction) {
  action.meta.returnType = 'childProcess'

  spyOnListener(context, 'childProcess', subject, ['on'])
  spyOnListener(context, 'childProcess', subject, ['stdout', 'on'])
  spyOnListener(context, 'childProcess', subject, ['stderr', 'on'])
  return subject
}

function stubChildProcess(context: SpecContext) {
  const on = {}
  const stdout = {}
  const stderr = {}
  setImmediate(() => {
    context.on('childProcess', action => {
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
      context.next()
    })
  })
  function push(bag, event, callback) {
    (bag[event] = bag[event] || []).push(callback)
  }
  return {
    on(event, callback) {
      push(on, event, callback)
    },
    stdout: {
      on(event, callback) {
        push(stdout, event, callback)
      }
    },
    stderr: {
      on(event, callback) {
        push(stderr, event, callback)
      }
    }
  }
}
