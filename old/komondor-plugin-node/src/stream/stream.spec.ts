import t from 'assert'
import fs from 'fs'
import { spec, functionConstructed, functionInvoked, functionReturned, promiseConstructed, promiseResolved } from 'komondor'
import k from 'komondor-test'
import fetch from 'node-fetch'
import stream from 'stream'

import { streamConstructed, streamMethodInvoked, streamMethodReturned, streamReceivedMultipleData } from '..'

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

test('acceptance', async () => {
  const s = await spec.simulate('stream/acceptance/helloWorld', readStream)
  const read = s.subject()
  let message = ''
  await new Promise(a => {
    read.on('data', chunk => message += chunk)
    read.on('end', () => a())
  })

  t.strictEqual(message, 'hello world')

  await s.satisfy([
    { ...functionConstructed({ functionName: 'readStream' }), instanceId: 1 },
    { ...functionInvoked(), instanceId: 1, invokeId: 1 },
    { ...functionReturned(), instanceId: 1, invokeId: 1, returnType: 'node/stream', returnInstanceId: 1 },
    { ...streamConstructed(), instanceId: 1 },
    { ...streamMethodInvoked(['on'], 'data'), instanceId: 1, invokeId: 1 },
    { ...functionConstructed(), instanceId: 2, sourceType: 'node/stream', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [1] },
    { ...streamMethodReturned(['on']), instanceId: 1, invokeId: 1 },
    { ...streamMethodInvoked(['on'], 'end'), instanceId: 1, invokeId: 2 },
    { ...functionConstructed(), instanceId: 3, sourceType: 'node/stream', sourceInstanceId: 1, sourceInvokeId: 2, sourceSite: [1] },
    { ...streamMethodReturned(['on']), instanceId: 1, invokeId: 2 },
    streamReceivedMultipleData()
  ])
})

async function simpleStreamTest(title, spec) {
  test(title, async () => {
    const s = await spec(readStream)
    const read = s.subject()
    let message = ''
    await new Promise(a => {
      read.on('data', chunk => message += chunk)
      read.on('end', () => a())
    })

    t.strictEqual(message, 'hello world')
    await s.satisfy([
      { ...functionConstructed({ functionName: 'readStream' }), instanceId: 1 },
      { ...functionInvoked(), instanceId: 1, invokeId: 1 },
      { ...functionReturned(), instanceId: 1, invokeId: 1, returnType: 'node/stream', returnInstanceId: 1 },
      { ...streamConstructed(), instanceId: 1 },
      { ...streamMethodInvoked(['on'], 'data'), instanceId: 1, invokeId: 1 },
      { ...functionConstructed(), instanceId: 2, sourceType: 'node/stream', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [1] },
      { ...streamMethodReturned(['on']), instanceId: 1, invokeId: 1 },
      { ...streamMethodInvoked(['on'], 'end'), instanceId: 1, invokeId: 2 },
      { ...functionConstructed(), instanceId: 3, sourceType: 'node/stream', sourceInstanceId: 1, sourceInvokeId: 2, sourceSite: [1] },
      { ...streamMethodReturned(['on']), instanceId: 1, invokeId: 2 },
      streamReceivedMultipleData()
    ])
  })
}

k.save('stream/save', simpleStreamTest)
k.simulate('stream/simulate', simpleStreamTest)


function promiseStream() {
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
  const read = readStream()
  return new Promise<stream.Stream>(a => {
    setImmediate(() => {
      a(read)
    })
  })
}
async function promiseReturnStreamTest(title, spec) {
  test(title, async () => {
    const s = await spec(promiseStream)
    const read = await s.subject()
    const actual = await new Promise(a => {
      let message = ''
      read.on('data', m => message += m)
      read.on('end', () => a(message))
    })
    t.strictEqual(actual, 'hello world')

    await s.satisfy([
      { ...functionConstructed({ functionName: 'promiseStream' }), instanceId: 1 },
      { ...functionInvoked(), instanceId: 1, invokeId: 1 },
      { ...functionReturned(), instanceId: 1, invokeId: 1, returnType: 'promise', returnInstanceId: 1 },
      { ...promiseConstructed(), instanceId: 1 },
      { ...promiseResolved(), instanceId: 1, invokeId: 1, returnType: 'node/stream', returnInstanceId: 1 },
      { ...streamConstructed(), instanceId: 1 },
      { ...streamMethodInvoked(['on'], 'data'), instanceId: 1, invokeId: 1 },
      { ...functionConstructed(), instanceId: 2, sourceType: 'node/stream', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [1] },
      { ...streamMethodReturned(['on']), instanceId: 1, invokeId: 1 },
      { ...streamMethodInvoked(['on'], 'end'), instanceId: 1, invokeId: 2 },
      { ...functionConstructed(), instanceId: 3, sourceType: 'node/stream', sourceInstanceId: 1, sourceInvokeId: 2, sourceSite: [1] },
      { ...streamMethodReturned(['on']), instanceId: 1, invokeId: 2 },
      streamReceivedMultipleData()
    ])
  })
}

k.save('promise returning a stream', 'stream/promise/readStream', promiseReturnStreamTest)
// this test uses `readStreamReplay` as source because it causes concurrency issue with the `save` test.
// It doesn't happen in actual usage as there should be only one test accessing one spec file.
k.simulate('promise returning a stream', 'stream/promise/readStreamSimulate', promiseReturnStreamTest)

k.simulate('file upload stream', 'spec/node-fetch/input-stream', (title, spec) => {
  test(title, async () => {
    async function wrapFetch(url, options) {
      const resp = await fetch(url, options)
      const result = await resp.json()
      return result.data
    }
    const s = await spec(wrapFetch)
    const size = fs.statSync('fixtures/node-fetch/file.txt').size
    const file = fs.createReadStream('fixtures/node-fetch/file.txt')
    const actual = await s.subject('http://httpbin.org/post', {
      method: 'POST',
      headers: {
        'Content-length': size
      },
      body: file
    })

    t.strictEqual(actual, 'file\n')

    await s.done()
  })
})
