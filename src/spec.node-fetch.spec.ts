import a from 'assertron'
import fs from 'fs'
import { Registrar } from 'komondor-plugin'
import fetch from 'node-fetch'

import { registerPlugin } from '.'
import k from './testUtil'

registerPlugin({
  activate(r: Registrar) {
    r.register(
      'stream-test',
      subject => subject.mode !== undefined &&
        subject.flags !== undefined &&
        subject.path !== undefined,
      (_context, subject) => subject,
      (_context, subject) => subject,
      subject => ({
        mode: subject.mode,
        flags: subject.flags,
        path: subject.path
      })
    )
  }
})

k.trio('file upload stream', 'spec/node-fetch/input-stream', (title, spec) => {
  test(title, async () => {
    const s = await spec(fetch)
    const size = fs.statSync('fixtures/node-fetch/file.txt').size
    const file = fs.createReadStream('fixtures/node-fetch/file.txt')
    const resp = await s.subject('http://httpbin.org/post', {
      method: 'POST',
      headers: {
        'Content-length': size
      },
      body: file
    })

    a.satisfy(resp, { size: 0, timeout: 0 })

    await s.done()
  })
})
