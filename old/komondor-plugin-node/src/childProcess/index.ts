import { Registrar, StubContext, SpyContext, SpyInstance } from 'komondor-plugin'

const TYPE = 'node/childProcess'

export function childProcessConstructed() {
  return { type: TYPE, name: 'construct' }
}

export function childProcessInvoked(site: string[], ...args: any[]) {
  return { type: TYPE, name: 'invoke', payload: args, meta: { site } }
}

export function childProcessReturned(site: string[], result?) {
  return { type: TYPE, name: 'return', payload: result, meta: { site } }
}

export function activate(registrar: Registrar) {
  registrar.register(
    TYPE,
    isChildProcess,
    spyChildProcess,
    stubChildProcess
  )
}

function isChildProcess(subject) {
  return subject && typeof subject.on === 'function' &&
    subject.stdout && typeof subject.stdout.on === 'function' &&
    subject.stderr && typeof subject.stderr.on === 'function'
}
function spyChildProcess(context: SpyContext, subject) {
  const instance = context.newInstance()
  spyOnListener(instance, TYPE, subject, ['on'])
  spyOnListener(instance, TYPE, subject, ['stdout', 'on'])
  spyOnListener(instance, TYPE, subject, ['stderr', 'on'])
  return subject
}

function spyOnListener(instance: SpyInstance, type: string, base, site: string[]) {
  const subject = site.reduce((p, v, i) => {
    if (i === site.length - 1)
      return p
    return p[v]
  }, base)
  const methodName = site[site.length - 1]
  const fn: Function = subject[methodName]
  subject[methodName] = function (event, cb) {
    const call = instance.newCall({ site })
    const spiedArgs = call.invoke([event, cb])
    const result = fn.call(subject, ...spiedArgs)
    call.return(undefined)
    return result
  }
}

function stubChildProcess(context: StubContext) {
  const instance = context.newInstance()
  // TODO: create a complete fake childProcess
  return {
    on(event, callback) {
      const call = instance.newCall({ site: ['on'] })
      call.invoked([event, callback])
      call.blockUntilReturn()
      return call.result()
    },
    stdout: {
      on(event, callback) {
        const call = instance.newCall({ site: ['stdout', 'on'] })
        call.invoked([event, callback])
        call.blockUntilReturn()
        return call.result()
      }
    },
    stderr: {
      on(event, callback) {
        const call = instance.newCall({ site: ['stderr', 'on'] })
        call.invoked([event, callback])
        call.blockUntilReturn()
        return call.result()
      }
    }
  }
}
