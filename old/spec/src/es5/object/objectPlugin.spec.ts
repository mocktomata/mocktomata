import * as es5Module from '..';
import { createTestHarness } from '../..';
import { objectPlugin } from './objectPlugin';

import k from '../../testUtil'
import { loadPlugins } from '../../plugin';

beforeAll(async () => {
  const harness = createTestHarness()
  harness.io.addPluginModule('@komondor-lab/spec/es5', es5Module)
  await loadPlugins(harness)
})

test('support object', () => {
  expect(objectPlugin.support({})).toBe(true)
})


k.trio('es5/object: get primitive property', (title, spec) => {
  test(title, async () => {
    const s = await spec({ a: 1 })
    const actual = s.subject.a

    expect(actual).toBe(1)

    await s.done()
  })
})
