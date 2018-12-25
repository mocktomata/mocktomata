import t from 'assert';
import { createIO } from './createIO';
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
    const io = createIO({ url: 'http://localhost' })
    const expected = { actions: [], expectation: 'abc' };
    io.fetch = () => Promise.resolve({ json: () => expected })

    const actual = await io.readSpec('abc')
    t.deepStrictEqual(actual, expected)
  })
})

describe('loadConfig()', () => {
  test('load', async () => {
    const io = createIO({ url: 'http://localhost:4000' })
    const actual = await io.loadConfig()
    console.log(actual)
  })
})
