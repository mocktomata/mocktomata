import { logLevel } from '@unional/logging';
import a from 'assertron';
import delay from 'delay';
import { createTestHarness, loadPlugins, TestHarness } from '..';
import { echoPluginModule } from '../test-util';
import { createLiveSpec, createSaveSpec, createSimulateSpec } from './createSpec';
import * as es5Module from '../es5'
import { SimulationMismatch } from './errors';

describe('timeout warning', () => {
  let harness: TestHarness
  beforeEach(async () => {
    harness = createTestHarness({ showLog: false })
    harness.io.addPluginModule('echo', echoPluginModule)
    await loadPlugins(harness)
  })

  afterEach(() => harness.reset())

  test(`createLiveSpec() logs a warning message if stop() was not called within specified 'timeout'.`, async () => {
    const recorder = await createLiveSpec(harness, 'timeout', {}, { timeout: 10 })

    await delay(30)
    await recorder.done()

    a.satisfies(harness.appender.logs, [{ id: 'komondor', level: logLevel.warn, messages: ['done() was not called in 10 ms. Did the test takes longer than expected or you forget to call done()?'] }])
  })

  test(`createSaveSpec() logs a warning message if stop() was not called within specified 'timeout'.`, async () => {
    const recorder = await createSaveSpec(harness, 'timeout', {}, { timeout: 10 })

    await delay(30)
    await recorder.done()

    a.satisfies(harness.appender.logs, [{ id: 'komondor', level: logLevel.warn, messages: ['done() was not called in 10 ms. Did the test takes longer than expected or you forget to call done()?'] }])
  })

  test(`createLiveSpec() will not log warning message if stop() is called before the specified 'timeout'.`, async () => {
    const recorder = await createLiveSpec(harness, 'timeout', {}, { timeout: 10 })
    await recorder.done()
    await delay(30)

    a.satisfies(harness.appender.logs, [])
  })

  test(`createSaveSpec() will not log warning message if stop() is called before the specified 'timeout'.`, async () => {
    const recorder = await createSaveSpec(harness, 'timeout', {}, { timeout: 10 })
    await recorder.done()
    await delay(30)

    a.satisfies(harness.appender.logs, [])
  })

  test('createSimulateSpec() throws PluginNotFound if the recorded spec uses a plugin not loaded', async () => {
    const harness = createTestHarness()
    harness.io.addPluginModule('es5', es5Module)
    await loadPlugins(harness)

    harness.io.specs['plugin not loaded'] = JSON.stringify({
      refs: [{
        plugin: 'function'
      }],
      actions: [
        { type: 'invoke', id: '0', payload: [1] }
      ]
    })

    const s = await createSimulateSpec(harness, 'plugin not loaded', function (x: any) { return x }, { timeout: 10 })

    a.throws(() => s.subject('arg'), SimulationMismatch)

    await s.done()
  })
})
