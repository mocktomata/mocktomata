import { addAppender, getLogger, logLevel, removeAppender } from '@unional/logging';
import a from 'assertron';
import { MemoryAppender } from 'aurelia-logging-memory';
import delay from 'delay';
import { loadPlugins, PluginActivationContext } from '../../plugin';
import { createMemoryIO, MemoryIO } from '../../test-util';
import { NotSpecable } from '../errors';
import { resetStore } from '../../store';
import { createLiveSpec } from './createLiveSpec';

let appender: MemoryAppender
let io: MemoryIO
const log = getLogger('komondor', logLevel.debug)
beforeEach(() => {
  appender = new MemoryAppender()
  addAppender(appender)
  io = createMemoryIO()
  resetStore()
})

afterEach(() => {
  removeAppender(appender)
})

describe('timeout warning', () => {
  test(`when test did not call done within specified 'timeout', a warning message will be displayed.`, async () => {
    io.addPlugin('dumb', dumbPluginModule)
    await loadPlugins({ io })

    const s = await createLiveSpec({ log, io }, 'timeout', () => true, { timeout: 10 })
    await delay(30)
    await s.done()

    a.satisfies(appender.logs, [{ id: 'komondor', level: 20, messages: ['done() was not called in 10 ms. Did the test takes longer than expected or you forget to call done()?'] }])
  })

  test('calling done will stop timeout warning', async () => {
    io.addPlugin('dumb', dumbPluginModule)
    await loadPlugins({ io })

    const s = await createLiveSpec({ log, io }, 'timeout', () => true, { timeout: 10 })
    await s.done()
    await delay(30)

    a.satisfies(appender.logs, [])
  })
})

test('no suitable plugin throws NotSpecable', async () => {
  const spyPlugin = { support: jest.fn(), getSpy: jest.fn(), getStub: jest.fn() }
  io.addPlugin('spy', {
    activate(context) {
      context.register(spyPlugin)
    }
  })
  await loadPlugins({ io })

  spyPlugin.support.mockReturnValue(false)
  await a.throws(
    createLiveSpec({ log, io }, 'no supporting plugin', 'no supporting plugin', { timeout: 300 }),
    NotSpecable)
})

test('supported plugin got getSpy() invoked', async () => {
  const spyPlugin = { support: jest.fn(), getSpy: jest.fn(), getStub: jest.fn() }
  io.addPlugin('spy', {
    activate(context) {
      context.register(spyPlugin)
    }
  })
  await loadPlugins({ io })

  spyPlugin.support.mockReturnValue(true)
  const s = await createLiveSpec({ log, io }, 'call spy', 'call spy', { timeout: 300 })
  await s.done()
  expect(spyPlugin.getSpy.mock.calls.length).toBe(1)
})

const dumbPluginModule = {
  activate(context: PluginActivationContext) {
    context.register(dumbPlugin)
  }
}

const dumbPlugin = {
  support: () => true,
  getSpy: () => undefined,
  getStub: () => undefined
}
