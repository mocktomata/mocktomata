import { logLevel } from '@unional/logging';
import a from 'assertron';
import delay from 'delay';
import { createTestHarness, loadPlugins } from '..';
import { NotSpecable } from '../errors';
import { echoPluginModule } from '../test-util';
import { createActionRecorder } from './ActionRecorder';

describe('timeout warning', () => {
  let harness: ReturnType<typeof createTestHarness>
  beforeEach(async () => {
    harness = createTestHarness()
    harness.io.addPluginModule('echo', echoPluginModule)
    await loadPlugins(harness)
  })

  afterEach(() => {
    harness.reset()
  })

  test(`log a warning message if stop() was not called within specified 'timeout'.`, async () => {
    const recorder = createActionRecorder(harness, 'timeout', 'abc', { timeout: 10 })

    await delay(30)
    await recorder.end()

    a.satisfies(harness.appender.logs, [{ id: 'komondor', level: logLevel.warn, messages: ['done() was not called in 10 ms. Did the test takes longer than expected or you forget to call done()?'] }])
  })

  test(`not log warning message if stop() is called before the specified 'timeout'.`, async () => {
    const recorder = createActionRecorder(harness, 'timeout', 'abc', { timeout: 10 })
    await recorder.end()
    await delay(30)

    a.satisfies(harness.appender.logs, [])
  })

  test(`not log warning message if save() is called before the specified 'timeout'.`, async () => {
    const recorder = createActionRecorder(harness, 'timeout', 'abc', { timeout: 10 })
    await recorder.save()
    await delay(30)

    a.satisfies(harness.appender.logs, [])
  })
})

describe('no supported plugin for subject', () => {
  let harness: ReturnType<typeof createTestHarness>
  beforeEach(async () => {
    harness = createTestHarness()
  })

  afterEach(() => {
    harness.reset()
  })

  test('throws NotSpecable', () => {
    a.throws(() => createActionRecorder(harness, 'throw not specable', 'abc', { timeout: 30 }), NotSpecable)
  })
})

