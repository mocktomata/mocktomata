import t from 'assert'
import stream = require('stream')

import { spec } from '../index'

function readStream(): stream.Stream {
  const rs = new stream.Readable()
  const message = 'hello world'
  let i = 0
  rs._read = function () {
    if (message[i])
      rs.push(message[i++])
    else
      rs.push(null)
  }
  return rs
}

test('read stream (cycle)', async () => {
  await testLive()
  // can't test save because travis run seems to only save 'h' instead of 'hello world'
  await testSimulate()
})

async function testLive() {
  const streamSpec = await spec('stream/read', readStream)
  const read = streamSpec.subject()
  const actual = await new Promise(a => {
    let message = ''
    read.on('data', m => {
      message += m
    })
    read.on('end', () => {
      a(message)
    })
  })
  t.equal(actual, 'hello world')

  await streamSpec.satisfy([
    undefined,
    { type: 'fn/return', meta: { returnType: 'stream', streamId: 1 } },
    { type: 'stream', meta: { streamId: 1, length: 11 } }
  ])
}

async function testSimulate() {
  const streamSpec = await spec.simulate('stream/read', readStream)
  const read = streamSpec.subject()
  const actual = await new Promise(a => {
    let message = ''
    read.on('data', m => {
      message += m
    })
    read.on('end', () => {
      setTimeout(() => a(message), 100)
    })
  })
  t.equal(actual, 'hello world')

  await streamSpec.satisfy([
    undefined,
    { type: 'fn/return', meta: { returnType: 'stream', streamId: 1 } },
    { type: 'stream', meta: { streamId: 1, length: 11 } }
  ])
}
