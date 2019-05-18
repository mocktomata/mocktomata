import { logLevel } from '@unional/logging';
import a from 'assertron';
import delay from 'delay';
import { createTestHarness, TestHarness } from '../createTestHarness';
import { createRecorder } from './createRecorder';
import { SpecOptions } from './types';
import { NotSpecable } from '../errors';
import { loadPlugins } from '..';
import { echoPlugin } from '../test-util';

const specOptions: SpecOptions = { timeout: 30 }

describe('timeout warning', () => {
  let harness: TestHarness
  beforeEach(async () => {
    harness = createTestHarness({ showLog: false })
  })

  afterEach(() => harness.reset())

  test(`log a warning message if stop() was not called within specified 'timeout'.`, async () => {
    const recorder = createRecorder(harness, 'timeout', { timeout: 10 })

    await delay(30)
    await recorder.end()

    a.satisfies(harness.appender.logs, [{ id: 'komondor', level: logLevel.warn, messages: ['done() was not called in 10 ms. Did the test takes longer than expected or you forget to call done()?'] }])
  })

  test(`not log warning message if stop() is called before the specified 'timeout'.`, async () => {
    const recorder = createRecorder(harness, 'timeout', { timeout: 10 })
    await recorder.end()
    await delay(30)

    a.satisfies(harness.appender.logs, [])
  })

  test(`not log warning message if save() is called before the specified 'timeout'.`, async () => {
    const recorder = createRecorder(harness, 'timeout', { timeout: 10 })
    await recorder.save()
    await delay(30)

    a.satisfies(harness.appender.logs, [])
  })
})

// This should not happen when the basic support is in.
test('getSpy() throws NotSpecable when there is no supported plugin', () => {
  const harness = createTestHarness()
  const recorder = createRecorder(harness, 'throw not specable', specOptions)

  a.throws(() => recorder.getSpy('not supported'), NotSpecable)
})

// describe('getSpy()', () => {
//   let harness: TestHarness
//   beforeEach(async () => {
//     harness = createTestHarness()
//     harness.io.addPlugin('echo', echoPlugin)
//     await loadPlugins(harness)
//   })

//   afterEach(() => harness.reset())

//   test('no recording is created when save without action', async () => {
//     const recorder = createRecorder(harness, 'without action', specOptions)

//     recorder.getSpy('identity')
//     await recorder.save()

//     expect(harness.getSpec('without action')).toBeUndefined()
//   })
// })

const specRecord = {
  refs: {
    '1': {
      plugin: 'es5/function',
      subjectId: 1,
      invokeId: 1
      // no value means it is from real time
    },
    '2': {
      plugin: 'es5/error',
      value: { message: 'abc' }
    },
    '3': {
      plugin: 'es5/string',
      value: 'actual string'
    },
    '4': {
      plugin: 'es2015/symbol',
      value: 'get from input or create in real time'
    },
    '5': {
      plugin: 'es5/function',
      value: 'from real time'
    }
  },
  actions: [
    { type: 'invoke', payload: ['2', '4'], ref: '1' },
    { type: 'invoke', payload: [], ref: '4' }
  ]
}
