import { SpecContext, ReturnAction } from '../index'

export function getReturnSpy(context: SpecContext, subject, action: ReturnAction) {
  if (!isChildProcess(subject)) return undefined
  return spyChildProcess(context, subject, action)
}

export function getReturnStub(context: SpecContext, action: ReturnAction) {
  if (action.meta.returnType !== 'childProcess') return undefined
  return childProcessStub(context)
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

function childProcessStub(context: SpecContext) {
  const on = {}
  const stdout = {}
  const stderr = {}
  setImmediate(() => {
    processUntilCloseEvent(context, { on, stdout, stderr })
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

function processUntilCloseEvent(context: SpecContext, { on, stdout, stderr }) {
  const action = context.peek()
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

  context.next()
  processUntilCloseEvent(context, { on, stdout, stderr })
}

