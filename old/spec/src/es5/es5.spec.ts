import { createTestHarness, TestHarness } from '..';
import * as es5Module from '.'
import { loadPlugins } from '../plugin';
import k from '../testUtil';

let harness: TestHarness
beforeEach(async () => {
  harness = createTestHarness()
  harness.io.addPluginModule('@mocktomata/es5', es5Module)
  await loadPlugins(harness)
})

afterEach(() => harness.reset())

k.trio('es5: function without argument', (title, spec) => {
  test(title, async () => {
    const s = await spec(() => 'abc')
    const actual = s.subject()
    expect(actual).toBe('abc')

    await s.done()
  })
})
