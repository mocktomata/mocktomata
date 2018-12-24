import t from 'assert';
import fetch from 'node-fetch';
import { dirSync } from 'tmp';
import { createServer } from '.';

test('server uses specified port', () => {
  const server = createServer({ port: 3224 })
  t.strictEqual(server.info.port, 3224)
})

test('can read and write spec', async () => {
  const tmp = dirSync()

  const port = 7892
  const server = createServer({ port })

  const cwd = process.cwd()
  try {
    process.chdir(tmp.name)
    await server.start()
    await fetch(`http://localhost:${port}/spec/abc`, { method: 'POST', body: '{ a: 1 }' })

    const response = await fetch(`http://localhost:${port}/spec/abc`)
    const actual = await response.text()
    t.strictEqual(actual, '{ a: 1 }')
  }
  finally {
    process.chdir(cwd)
  }
})
