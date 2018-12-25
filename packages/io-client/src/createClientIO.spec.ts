import t from 'assert';
import { createClientIO } from './createClientIO';
import { createServer } from '@komondor-lab/io-server'

let server: ReturnType<typeof createServer>
beforeAll(async () => {
  server = createServer({ port: 4000 })
  await server.start()
})
afterAll(async () => {
  await server.stop()
})

describe('readSpec()', () => {
  test('read existing spec', async () => {
    const io = await createClientIO({ url: 'http://localhost:4000' })
    const expected = { actions: [], expectation: 'abc' };
    io._deps.fetch = () => Promise.resolve({ json: () => expected } as any)

    const actual = await io.readSpec('abc')
    t.deepStrictEqual(actual, expected)
  })
})

describe('loadConfig()', () => {
  test('load...', async () => {
    const io = await createClientIO({ url: 'http://localhost:4000' })
    await io.loadConfig()
  })
})
