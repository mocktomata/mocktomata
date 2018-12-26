import { createServer } from '@komondor-lab/io-server';
import t from 'assert';
import { dirSync } from 'tmp';
import { createClientIO } from './createClientIO';

let tmp = dirSync()
let server: ReturnType<typeof createServer>
const port = 4000
let url = `http://localhost:${port}`
beforeAll(async () => {
  server = createServer({ port, cwd: tmp.name })
  await server.start()
})
afterAll(async () => {
  await server.stop()
})

describe('readSpec()', () => {
  test('read existing spec', async () => {
    const io = await createClientIO({ url })
    const expected = { actions: [], expectation: 'abc' };
    io._deps.fetch = () => Promise.resolve({ json: () => expected } as any)

    const actual = await io.readSpec('abc')
    t.deepStrictEqual(actual, expected)
  })
})

describe('loadConfig()', () => {
  test('load...', async () => {
    const io = await createClientIO({ url })
    await io.loadConfig()
  })
})

describe('loadPlugin()', () => {
  test.skip('Load existing plugin', async () => {
    const io = await createClientIO({ url })
    // TODO: Use fs to add @komondor-lab/plugin-fixture-dummy to the tmp folder
    await io.loadPlugin(`@komondor-lab/plugin-fixture-dummy`)
    // t(typeof m.activate === 'function')
  })
})
