import a from 'assertron';
import delay from 'delay';
import { logLevel } from 'standard-log';
import { createTestHarness, loadPlugins, TestHarness } from '..';
import * as es5Module from '../es5';
import { createLiveSpec } from './createLiveSpec';
import { createSaveSpec } from './createSaveSpec';
import { createSimulateSpec } from './createSimulateSpec';
import { ReferenceMismatch } from './errors';
import { SpecRecord } from './types';

let harness: TestHarness
beforeEach(async () => {
  harness = createTestHarness({ showLog: false })
  harness.io.addPluginModule('es5', es5Module)
  await loadPlugins(harness)
})

afterEach(() => harness.reset())

const testOptions = { timeout: 10 }
describe('timeout warning', () => {
  test(`createSaveSpec() logs a warning message if stop() was not called within specified 'timeout'.`, async () => {
    const s = await createSaveSpec(harness, 'timeout', () => { }, testOptions)
    s.subject()

    await delay(30)
    await s.done()

    a.satisfies(harness.reporter.logs, [{ id: 'komondor', level: logLevel.warn, args: ['done() was not called in 10 ms. Did the test takes longer than expected or you forget to call done()?'] }])
  })

  test(`createLiveSpec() will not log warning message if stop() is called before the specified 'timeout'.`, async () => {
    const recorder = await createLiveSpec(harness, 'timeout', {}, testOptions)
    await recorder.done()
    await delay(30)

    a.satisfies(harness.reporter.logs, [])
  })

  test(`createSaveSpec() will not log warning message if stop() is called before the specified 'timeout'.`, async () => {
    const recorder = await createSaveSpec(harness, 'timeout', {}, testOptions)
    await recorder.done()
    await delay(30)

    a.satisfies(harness.reporter.logs, [])
  })
})

test('createSimulateSpec() throws PluginNotFound if the recorded spec uses a plugin not loaded', async () => {
  await harness.io.writeSpec('plugin not loaded', {
    refs: [{ plugin: 'unknown' }],
    actions: [
      { type: 'invoke', ref: '0', payload: [1] }
    ]
  } as SpecRecord)

  await a.throws(createSimulateSpec(harness, 'plugin not loaded', function (x: any) { return x }, testOptions), ReferenceMismatch)
})
