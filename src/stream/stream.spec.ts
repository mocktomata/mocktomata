import { test } from 'ava'
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

test('read stream', async t => {
  const streamSpec = await spec(readStream, { id: 'stream/read', mode: 'save' })
  const read = streamSpec.subject()
  const actual = await new Promise(a => {
    let message = ''
    read.on('data', m => {
      message += m
    })
    read.on('end', () => {
      a(message)
    })
    t.pass()
  })
  t.is(actual, 'hello world')

  await streamSpec.satisfy([
    undefined,
    { type: 'fn/return', meta: { type: 'stream', id: 1 } },
    { type: 'stream', meta: { id: 1, length: 11 } }
  ])
})

test('read stream verify', async t => {
  const streamSpec = await spec(readStream, { id: 'stream/read', mode: 'replay' })
  const read = streamSpec.subject()
  const actual = await new Promise(a => {
    let message = ''
    read.on('data', m => {
      message += m
    })
    read.on('end', () => {
      a(message)
    })
    t.pass()
  })
  t.is(actual, 'hello world')

  await streamSpec.satisfy([
    undefined,
    { type: 'fn/return', meta: { type: 'stream', id: 1 } },
    { type: 'stream', meta: { id: 1, length: 11 } }
  ])
})
