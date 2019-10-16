import { createFileRepository } from '.';

test('load npm plugin package', async () => {
  const io = createFileRepository('fixtures/has-plugins')
  const actual = await io.loadPlugin('@mocktomata/plugin-fixture-dummy')
  expect(typeof actual.activate).toBe('function')
})

test('can load plugin using deep link', async () => {
  const io = createFileRepository('fixtures/has-plugins')
  const actual = await io.loadPlugin('@mocktomata/plugin-fixture-deep-link/pluginA')

  expect(typeof actual.activate).toBe('function')
})
