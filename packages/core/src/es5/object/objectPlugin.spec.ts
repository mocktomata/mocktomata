import * as es5Module from '..';
import { createTestHarness } from '../..';
import { loadPlugins } from '../../plugin';
import { objectPlugin } from './objectPlugin';

beforeAll(async () => {
  const harness = createTestHarness()
  harness.io.addPluginModule('@komondor-lab/spec/es5', es5Module)
  await loadPlugins(harness)
})

test('support object', () => {
  expect(objectPlugin.support({})).toBe(true)
})
