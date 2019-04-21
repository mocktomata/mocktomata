import { findPlugin, loadPlugins } from '.';
import { createMemoryIO, dummyPluginModule } from '../test-util';

test('not supported subject gets undefined', () => {
  const notSupportedSubject = { oh: 'no' }
  expect(findPlugin(notSupportedSubject)).toBe(undefined)
})

test('find plugin that handles the subject', async () => {
  const io = createMemoryIO()
  io.addPlugin('@komondor-lab/plugin-fixture-dummy', dummyPluginModule)

  await loadPlugins({ io })
  const actual = findPlugin({})

  expect(actual).not.toBeUndefined();
})
