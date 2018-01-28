import { Stream, Writable } from 'stream'

import { SpecContext, SpecAction, ReturnAction, KomondorRegistrar, io } from '../index'

export function activate(registrar: KomondorRegistrar) {
  registrar.registerGetReturnSpy(getReturnSpy)
  registrar.registerGetReturnStub(getReturnStub)
}

function getReturnSpy(context: SpecContext, subject, action: ReturnAction) {
  if (!isStream(subject)) return undefined
  return spyStream(context, subject, action)
}

function getReturnStub(context: SpecContext, action: SpecAction) {
  if (action.meta.returnType !== 'stream') return undefined
  return stubStream(context, action)
}

function isStream(subject) {
  return subject instanceof Stream
}

let counts = {}
async function spyStream(context: SpecContext, subject: Stream, action: ReturnAction) {
  const streamId = counts[context.id] = counts[context.id] ? counts[context.id] + 1 : 1
  action.meta = { ...action.meta, returnType: 'stream', streamId }
  let writer: Writable
  if (context.mode === 'save') {
    writer = await io.createWriteStream(`${context.id}/stream_${streamId}`)
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
      meta: { streamId, length }
    })
    if (writer) writer.end()
  })
  return subject
}

function stubStream(context: SpecContext, action: SpecAction): Promise<Stream> {
  const readStream = io.createReadStream(`${context.id}/stream_${action.meta.streamId}`)
  context.on('stream', a => {
    if (a.meta.streamId === action.meta.streamId)
      context.next()
  })

  return readStream
}
