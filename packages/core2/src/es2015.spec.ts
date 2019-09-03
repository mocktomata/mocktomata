import * as es2015 from './es2015';
import { loadPlugins } from './spec/loadPlugins';
import k, { TestHarness } from './test-utils';

let harness: TestHarness
beforeAll(async () => {
  harness = k.createTestHarness()
  harness.io.addPluginModule('@komondor-lab/es5', es2015)
  await loadPlugins(harness)
})

describe('function', () => {
  k.duo('no input no result', (title, spec) => {
    test(title, async () => {
      const s = await spec.mock(() => { })
      expect(s()).toBeUndefined()

      await spec.done()
    })
  })
  k.duo('no input, string result', (title, spec) => {
    test(title, async () => {
      const s = await spec.mock(() => 'abc')
      const actual = s()
      expect(actual).toBe('abc')

      await spec.done()
    })
  })
})
