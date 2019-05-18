import a from 'assertron';
import { createTestHarness } from '../createTestHarness';
import { SimulationMismatch, SpecNotFound } from '../errors';
import { loadPlugins } from '../plugin';
import { echoPlugin } from '../test-util';
import { createActionPlayer } from './ActionPlayer';

let harness: ReturnType<typeof createTestHarness>
beforeEach(() => {
  harness = createTestHarness()
})

test('no recorded spec throws SpecNotFound', async () => {

  harness.io.addPlugin('echo', echoPlugin)
  await loadPlugins(harness)

  await a.throws(() => createActionPlayer(harness, 'no recorded spec throws SpecNotFound', 'abc'), SpecNotFound)
})

test('end with remaining action throws', async () => {
  harness.io.addPlugin('echo', echoPlugin)
  await loadPlugins(harness)

  harness.io.readSpec = async () => ({ actions: [{ type: 'construct', subjectInfo: { plugin: 'echo', subjectId: 1 }, payload: undefined }] })

  const player = await createActionPlayer(harness, 'echo', 'abc')
  a.throws(() => player.end(), SimulationMismatch)
})
