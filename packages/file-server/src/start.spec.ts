import { createFileRepository, Repository } from '@mocktomata/io-fs';
import t from 'assert';
import a from 'assertron';
import fetch from 'node-fetch';
import { dirSync } from 'tmp';
import { PromiseValue } from 'type-plus';
import { start } from '.';
import { btoa } from './base64';

test('automatically find a port between 3698 and 3798', async () => {
  const server = await start()
  expect(server.info.port).toBeGreaterThanOrEqual(3698)
  expect(server.info.port).toBeLessThanOrEqual(3798)
  await server.stop()
})

test('if a port is specified and not available, will throw an error', async () => {
  const runningServer = await start()
  const e = await a.throws<Error & Record<string, any>>(start({ port: Number(runningServer.info.port) }))
  await runningServer.stop()
  expect(e.code).toBe('EADDRINUSE')
})

describe('server behavior', () => {
  let server: PromiseValue<ReturnType<typeof start>>
  let repository: Repository
  beforeAll(async () => {
    const tmp = dirSync()
    repository = createFileRepository(tmp.name)
    await repository.writeSpec('exist', '', '{ "spec": "exist" }')
    server = await start({ cwd: tmp.name })
  })
  afterAll(() => {
    return server.stop()
  })

  function buildUrl(path: string) {
    return `http://localhost:${server.info.port}/mocktomata/${path}`
  }

  test('get mocktomata info', async () => {
    const response = await fetch(buildUrl('info'))
    const actual = await response.text()
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pjson = require('../../mocktomata/package.json')
    t.strictEqual(actual, `{"name":"mocktomata","version":"${pjson.version}","url":"http://localhost:${server.info.port}","plugins":[]}`)
  })

  test('read not exist spec gets 404', async () => {
    const response = await fetch(buildUrl(`specs/${buildId('not exist')}`))

    expect(response.status).toBe(404)
  })
  test('read spec', async () => {
    const response = await fetch(buildUrl(`specs/${buildId('exist')}`))

    expect(response.status).toBe(200)
    expect(await response.text()).toEqual('{ "spec": "exist" }')
  })

  test('write spec', async () => {
    const response = await fetch(buildUrl(`specs/${buildId('abc')}`), { method: 'POST', body: '{ a: 1 }' })

    expect(response.status).toBe(200)
    const actual = await repository.readSpec('abc', '')

    expect(actual).toEqual('{ a: 1 }')
  })
})

function buildId(specName: string, specRelativePath = '') {
  return btoa(JSON.stringify({ specName, specRelativePath }))
}
