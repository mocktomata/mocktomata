import t from 'assert';
import fetch from 'node-fetch';
import { dirSync } from 'tmp';
import { createServer } from '.';
import { createFileRepository } from '@komondor-lab/io-fs';

test('server defaults to port 3698', () => {
  const server = createServer()
  t.strictEqual(server.info.port, 3698)
})

describe('server behavior', () => {
  const tmp = dirSync()

  const repository = createFileRepository(tmp.name)
  const server = createServer({ port: 3698, repository })

  beforeAll(() => {
    return server.start()
  })

  afterAll(() => {
    return server.stop()
  })

  test('will start of the next port if the preious port is occupied', async () => {
    const server2 = createServer()

    try {
      await server2.start()
      t.strictEqual(server2.info.port, 3699)
    }
    finally {
      await server2.stop()
    }
  })

  test('get komondor info', async () => {
    const response = await fetch(`http://localhost:${server.info.port}/komondor/info`)
    const actual = await response.text()
    const pjson = require('../package.json')
    t.strictEqual(actual, `{"name":"komondor","version":"${pjson.version}","url":"http://localhost:3698","plugins":[]}`)
  })

  test('can read and write spec', async () => {
    await fetch(`http://localhost:${server.info.port}/komondor/specs/abc`, { method: 'POST', body: '{ a: 1 }' })

    const response = await fetch(`http://localhost:${server.info.port}/komondor/specs/abc`)
    const actual = await response.text()
    t.strictEqual(actual, '{ a: 1 }')
  })

  test('can read and write scenario', async () => {
    await fetch(`http://localhost:${server.info.port}/komondor/scenarios/abc`, { method: 'POST', body: '{ scen: 1 }' })

    const response = await fetch(`http://localhost:${server.info.port}/komondor/scenarios/abc`)
    const actual = await response.text()
    t.strictEqual(actual, '{ scen: 1 }')
  })
})
