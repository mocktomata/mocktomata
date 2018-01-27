// import stream = require('stream')
import { Stream, Writable, Readable } from 'stream'

import { SpecContext, SpecAction } from '../index'
import { io } from '../io'
// import { setImmediate } from 'timers';

export function getReturnSpy(context: SpecContext, subject, scope) {
  if (!isStream(subject)) return undefined
  return spyStream(context, subject, scope)
}

export function getReturnStub(context: SpecContext, action: SpecAction) {
  if (action.meta.returnType !== 'stream') return undefined
  return stubStream(context, action)
}

function isStream(subject) {
  return subject instanceof Stream
}

let counts = {}
function spyStream(context: SpecContext, subject: Stream, scope: string) {
  const id = counts[context.id] = counts[context.id] ? counts[context.id] + 1 : 1
  context.add({
    type: `${scope}/return`,
    payload: {},
    meta: { returnType: 'stream', id }
  })
  let writer: Writable
  if (context.mode === 'save') {
    writer = io.createWriteStream(`${context.id}/stream_${id}`)
  }
  let length = 0
  subject.on('data', chunk => {
    length += chunk.length
    if (writer) writer.write(chunk)
  })
  subject.on('end', () => {
    context.add({
      type: 'stream',
      payload: undefined,
      meta: { id, length }
    })
  })
  return subject
}

function stubStream(context: SpecContext, action: SpecAction): Readable {
  const readStream = io.createReadStream(`${context.id}/stream_${action.meta.id}`)
  const nextAction = context.peek()
  if (nextAction && nextAction.type === 'stream') {
    context.next()
  }
  else {
    context.on('stream', () => context.next())
  }
  // setImmediate(() => {
  //   if (!action || (action.type === 'stream' && action.meta.end))
  //     readStream.close()
  //   else if (action.type === 'stream') {
  //     const length = action.meta.length
  //     readStream.push()
  //   }
  // })
  return readStream
}
