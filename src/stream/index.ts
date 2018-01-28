// import stream = require('stream')
import { Stream, Writable, Readable } from 'stream'

import { SpecContext, SpecAction, ReturnAction } from '../index'
import { io } from '../io'
// import { setImmediate } from 'timers';

export function getReturnSpy(context: SpecContext, subject, action: ReturnAction) {
  if (!isStream(subject)) return undefined
  return spyStream(context, subject, action)
}

export function getReturnStub(context: SpecContext, action: SpecAction) {
  if (action.meta.returnType !== 'stream') return undefined
  return stubStream(context, action)
}

function isStream(subject) {
  return subject instanceof Stream
}

let counts = {}
function spyStream(context: SpecContext, subject: Stream, action: ReturnAction) {
  const id = counts[context.id] = counts[context.id] ? counts[context.id] + 1 : 1
  action.meta = { ...action.meta, returnType: 'stream', id }

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

  return readStream
}
