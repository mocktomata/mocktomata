import a from 'assertron';
import * as es2015 from './es2015';
import { loadPlugins } from './spec/loadPlugins';
import k, { TestHarness } from './test-utils';
import { simpleCallback } from './test-artifacts';

let harness: TestHarness
beforeAll(async () => {
  harness = k.createTestHarness()
  harness.io.addPluginModule('@komondor-lab/es2015', es2015)
  await loadPlugins(harness)
})

describe('function', () => {
  k.duo('no input no result', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(() => { })
      expect(subject()).toBeUndefined()

      await spec.done()
    })
  })
  k.duo('no input, string result', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(() => 'abc')
      const actual = subject()
      expect(actual).toBe('abc')

      await spec.done()
    })
  })
  k.duo('primitive inputs, simple result', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock((x: number, y: number) => x + y)
      const actual = subject(1, 2)

      expect(actual).toBe(3)

      await spec.done()
    })
  })
  k.duo('throwing error', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(() => { throw new Error('failed') })
      const err = a.throws(() => subject())

      expect(err.message).toBe('failed')

      await spec.done()
    })
  })
  k.duo('simple callback success (direct)', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(simpleCallback.success)
      let actual
      subject(2, (_, result) => {
        actual = result
      })

      expect(actual).toBe(3)

      await spec.done()
    })
  })
})
