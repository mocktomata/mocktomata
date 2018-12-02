import { Registrar, SpyContext, StubContext } from 'komondor-plugin'
import { Stream } from 'stream'
import { AtLeastOnce } from 'satisfier'

import { isBuffer } from '../Buffer'
const TYPE = 'node/stream'

export function streamConstructed() {
  return { type: TYPE, name: 'construct' }
}

export function streamReceivedMultipleData() {
  return new AtLeastOnce({ payload: p => Array.isArray(p) && isBuffer(p[0]) })
}

export function streamMethodInvoked(site: string[], ...args: any[]) {
  return { type: TYPE, name: 'invoke', payload: args, meta: { site } }
}
export function streamMethodReturned(site?: string[]) {
  return { type: TYPE, name: 'return', meta: { site } }
}

export function activate(registrar: Registrar) {
  registrar.register(
    TYPE,
    subject => (subject instanceof Stream) ||
      (subject && subject.path && subject.flags && subject.mode),
    (context, subject) => spyStream(context, subject),
    (context) => stubStream(context),
    subject => ({
      path: subject.path,
      flags: subject.flags,
      mode: subject.mode
    })
  )
}

function spyStream(context: SpyContext, subject: Stream) {
  const instance = context.newInstance()
  const on = subject.on
  subject['on'] = function (event, listener) {
    const call = instance.newCall({ site: ['on'] })
    const spiedArgs = call.invoke([event, listener])
    on.call(subject, ...spiedArgs)
    call.return(undefined)
    return this
  }
  return subject
}

function stubStream(context: StubContext) {
  const instance = context.newInstance()
  return {
    on(event, listener) {
      const call = instance.newCall({ site: ['on'] })
      const wrap = chunk => {
        listener(chunk && chunk.type === 'Buffer' ? Buffer.from(chunk.data) : chunk)
      }
      call.invoked([event, wrap])
      call.blockUntilReturn()
      return call.result()
    }
  }
}
