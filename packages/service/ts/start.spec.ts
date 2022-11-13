import { prettyPrintSpecRecord } from '@mocktomata/framework'
import { createIO } from '@mocktomata/nodejs'
import t from 'assert'
import a from 'assertron'
import fs, { readFileSync } from 'fs'
import f from 'node-fetch'
import path from 'path'
import { createStandardLog } from 'standard-log'
import { dirSync } from 'tmp'
import { PromiseValue } from 'type-plus'
import { btoa } from './base64.js'
import { start } from './index.js'

const fetch = f.default

test('if a port is specified and not available, will throw an error', async () => {
  const runningServer = await start({ port: 3710 })
  const e = await a.throws<Error & Record<string, any>>(start({ port: Number(runningServer.info.port) }))
  await runningServer.stop()
  expect(e.code).toBe('EADDRINUSE')
})

describe('server behavior', () => {
  let server: PromiseValue<ReturnType<typeof start>>
  beforeAll(async () => {
    const cwd = dirSync().name
    fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify({ mocktomata: { logLevel: 'trace' } }))
    const sl = createStandardLog()
    const log = sl.getLogger('test')
    const io = createIO({ cwd, log })
    await io.writeSpec('exist', '', { actions: [], refs: [] })
    log.info('file-server test: starting server...')
    server = await start({ cwd, port: 3456 })
    log.info('file-server test: started server...', JSON.stringify(server.info, undefined, '\n'))
  })
  afterAll(() => {
    return server.stop()
  })

  function buildUrl(path: string) {
    return `http://${server.info.address}:${server.info.port}/mocktomata/${path}`
  }

  test('get mocktomata info', async () => {
    const response = await fetch(buildUrl('info'))
    const actual = await response.text()

    const pjson = JSON.parse(readFileSync(path.resolve('./package.json'), 'utf-8'))
    t.strictEqual(actual, JSON.stringify({
      name: 'mocktomata',
      version: pjson.version,
      url: `http://localhost:${server.info.port}`,
      plugins: []
    }))
  })
  test('get config', async () => {
    const response = await fetch(buildUrl('config'))
    const actual = await response.json()
    expect(actual).toEqual({
      logLevel: 'trace'
    })
  })
  test('read not exist spec gets 404', async () => {
    const response = await fetch(buildUrl(`specs/${buildId('not exist')}`))

    expect(response.status).toBe(404)
  })
  test('read spec', async () => {
    const response = await fetch(buildUrl(`specs/${buildId('exist')}`))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ 'actions': [], 'refs': [] })
  })

  test('write spec', async () => {
    const id = buildId('abc')
    const body = prettyPrintSpecRecord({
      refs: [],
      actions: []
    })
    const response = await fetch(buildUrl(`specs/${id}`), {
      method: 'POST', body
    })
    expect(response.status).toBe(204)

    const actual = await (await fetch(buildUrl(`specs/${id}`))).json()

    expect(actual).toEqual({
      refs: [],
      actions: []
    })
  })
})

function buildId(specName: string, specRelativePath = '') {
  return btoa(JSON.stringify({ specName, specRelativePath }))
}
