import a from 'assertron';
import delay from 'delay';
import { NotSpecable } from '../errors';
import { loadPlugins } from '../plugin';
import { createTestHarness } from '../createTestHarness';
import { echoPluginModule } from '../test-util';
import { createLiveSpec } from './createSpec';

let harness: ReturnType<typeof createTestHarness>
beforeEach(() => {
  harness = createTestHarness()
})

afterEach(() => {
  harness.reset()
})

describe('timeout warning', () => {
  test(`when test did not call done within specified 'timeout', a warning message will be displayed.`, async () => {
    harness.io.addPluginModule('echo', echoPluginModule)
    await loadPlugins(harness)

    const s = await createLiveSpec(harness, 'timeout', () => true, { timeout: 10 })
    await delay(30)
    await s.done()

    a.satisfies(harness.appender.logs, [{ id: 'komondor', level: 20, messages: ['done() was not called in 10 ms. Did the test takes longer than expected or you forget to call done()?'] }])
  })

  test('calling done() will stop timeout warning', async () => {
    harness.io.addPluginModule('echo', echoPluginModule)
    await loadPlugins(harness)

    const s = await createLiveSpec(harness, 'timeout', () => true, { timeout: 10 })
    await s.done()
    await delay(30)

    a.satisfies(harness.appender.logs, [])
  })
})

test('no suitable plugin throws NotSpecable', async () => {
  const spyPlugin = { support: jest.fn(), getSpy: jest.fn(), getStub: jest.fn() }
  harness.io.addPluginModule('spy', {
    activate(context) {
      context.register(spyPlugin)
    }
  })
  await loadPlugins(harness)

  spyPlugin.support.mockReturnValue(false)
  await a.throws(
    createLiveSpec(harness, 'no supporting plugin', 'no supporting plugin', { timeout: 300 }),
    NotSpecable)
})

test('supported plugin got getSpy() invoked', async () => {
  const spyPlugin = { support: jest.fn(), getSpy: jest.fn(), getStub: jest.fn() }
  harness.io.addPluginModule('spy', {
    activate(context) {
      context.register(spyPlugin)
    }
  })
  await loadPlugins(harness)

  spyPlugin.support.mockReturnValue(true)
  const s = await createLiveSpec(harness, 'call spy', 'call spy', { timeout: 300 })
  await s.done()
  expect(spyPlugin.getSpy.mock.calls.length).toBe(1)
})
