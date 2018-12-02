import t from 'assert'
import fs from 'fs'
import { functionConstructed, functionInvoked, functionReturned, promiseConstructed, promiseResolved } from 'komondor'
import k from 'komondor-test'

import { streamConstructed, streamMethodInvoked, streamMethodReturned } from '..'

k.simulate('fs/readStream/success', (title, spec) => {
  test.skip(title, async () => {
    const read = (fileStream: fs.ReadStream) => {
      return new Promise(a => {
        const chunks: any[] = []
        fileStream.on('data', chunk => chunks.push(chunk))
        fileStream.on('end', () => a(chunks.join()))
      })
    }
    const s = await spec(read)
    const file = fs.createReadStream('fixtures/file.txt')
    const actual = await s.subject(file)
    t.strictEqual(actual, 'actual\n')

    await s.satisfy([
      { ...functionConstructed({ functionName: 'read' }), instanceId: 1 },
      { ...functionInvoked({ path: 'fixtures/file.txt' }), instanceId: 1, invokeId: 1 },
      { ...streamConstructed(), instanceId: 1, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [0] },
      { ...streamMethodInvoked(['on'], 'data'), instanceId: 1, invokeId: 1 },
      { ...streamMethodReturned(['on']), instanceId: 1, invokeId: 1 },
      { ...streamMethodInvoked(['on'], 'end'), instanceId: 1, invokeId: 2 },
      { ...streamMethodReturned(['on']), instanceId: 1, invokeId: 2 },
      { ...functionReturned(), instanceId: 1, invokeId: 1, returnType: 'promise', returnInstanceId: 1 },
      { ...promiseConstructed(), instanceId: 1 },
      { ...streamMethodInvoked(['on'], 'open'), instanceId: 1, invokeId: 3 },
      { ...streamMethodReturned(['on']), instanceId: 1, invokeId: 3 },
      { ...promiseResolved('actual\n'), instanceId: 1, invokeId: 1 }
    ])
  })
})
