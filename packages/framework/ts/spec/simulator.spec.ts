import { a } from 'assertron'
import { AsyncContext } from 'async-fp'
import { createStandardLogForTest } from 'standard-log/testing'
import { ExtraReference, loadConfig, PluginsNotLoaded } from '../index.js'
import { loadPlugins } from '../spec_plugin/index.js'
import { createStackFrameContext } from '../stack_frame.js'
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

test('simulates a record saved before symbol keys were supported', async () => {
	const { context } = createTestContext()
	const sim = createSimulator(
		context.extend(loadConfig).extend(loadPlugins).extend(initTimeTrackers),
		'string keys record',
		{
			refs: [
				{ plugin: '@mocktomata/object', profile: 'target', meta: { type: 'object', props: { a: 1, b: {} } } },
				{
					plugin: '@mocktomata/object',
					profile: 'target',
					source: { type: 'result', id: 2 },
					meta: { type: 'object', props: { c: 'x' } }
				},
				{ plugin: '@mocktomata/string', profile: 'target', source: { type: 'result', id: 4 }, meta: 'x' }
			],
			actions: [
				{ type: 'get', refId: '0', performer: 'user', tick: 0, key: 'a' },
				{ type: 'return', actionId: 0, tick: 0, payload: 1 },
				{ type: 'get', refId: '0', performer: 'user', tick: 0, key: 'b' },
				{ type: 'return', actionId: 2, tick: 0, payload: '1' },
				{ type: 'get', refId: '1', performer: 'user', tick: 0, key: 'c' },
				{ type: 'return', actionId: 4, tick: 0, payload: '2' }
			]
		},
		{ timeout: 10 }
	)

	const stub = await sim.createStub({ a: 2, b: { c: 'y' } })
	expect(stub.a).toBe(1)
	expect(stub.b.c).toBe('x')
	sim.end()
})
