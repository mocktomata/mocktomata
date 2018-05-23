import t from 'assert'
import a from 'assertron'
import delay from 'delay'
import fs from 'fs'

import { SpecNotFound } from '.'
import { Recorder } from './Recorder'
import { ensureFileNotExists } from './testUtil'

test('no record.json should not throw', async () => {
  const service = new Recorder()
  await service.load(`fixtures/record-service/no-record`)
})

test('missing spec throws SpecNotFound', async () => {
  const service = new Recorder()
  await service.load(`fixtures/record-service/no-record`)

  await a.throws(service.getSpec('not exist'), SpecNotFound)
})

test('record is saved to disk after some delay', async () => {
  ensureFileNotExists(`fixtures/record-service/spec-record/records.json`)

  const service = new Recorder({ saveDelay: 0 })
  await service.load(`fixtures/record-service/spec-record`)

  await service.setSpec('simple spec', { expectation: '[]', actions: [] })
  await delay(10)

  t(fs.existsSync(`fixtures/record-service/spec-record/records.json`))
})

test('multiple set in same time frame will only trigger one save', async () => {
  const service = new Recorder({ saveDelay: 10 })
  let count = 0
  service.save = () => Promise.resolve(count++)
  await service.load(`fixtures/record-service/spec-record`)

  for (let i = 0; i < 10; i++)
    await service.setSpec(`simple spec ${i}`, { expectation: '[]', actions: [] })
  await delay(10)

  t.equal(count, 1)
})
