import { a } from 'assertron'
import { AsyncContext } from 'async-fp'
import { createStandardLogForTest } from 'standard-log/testing'
import { ExtraReference, loadConfig, PluginsNotLoaded } from '../index.js'
import { createStackFrameContext } from '../stack_frame.js'
import { loadPlugins } from '../spec_plugin/index.js'
import { createTestContext, newMemoryIO } from '../testing/index.js'
import { initTimeTrackers } from '../time_trackter/time_tracker.js'
import { createSimulator } from './simulator.js'
import type { createSpec } from './types.internal.js'

test('create not expected stub throws', async () => {
	const { context } = createTestContext()
	const sim = createSimulator(
		context.extend(loadConfig).extend(loadPlugins).extend(initTimeTrackers),
		'extra ref',
		{ refs: [], actions: [] },
		{ timeout: 10 }
	)

	a.throws(() => sim.createStub({}), ExtraReference)
})

test('simulate without plugin install throws', () => {
	const io = newMemoryIO()
	const sl = createStandardLogForTest()
	const log = sl.getLogger('mocktomata')
	const { stackFrame } = createStackFrameContext({ cwd: process.cwd() })
	const context = new AsyncContext<createSpec.Context>({
		io,
		log,
		mode: 'simulate',
		specName: 'no plugin',
		options: { timeout: 10 },
		specRelativePath: '',
		config: {},
		plugins: [],
		timeTrackers: [],
		maskCriteria: [],
		stackFrame
	})
	const simulator = createSimulator(
		context,
		'no plugin',
		{ refs: [{ plugin: 'not-installed', profile: 'target' }], actions: [] },
		{ timeout: 10 }
	)
	a.throws(() => simulator.createStub(() => {}), PluginsNotLoaded)
})
