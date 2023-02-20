import { SpecNotFound, type SpecRecord } from '@mocktomata/framework'
import { a } from 'assertron'
import { createStandardLogForTest } from 'standard-log'
import { ServerNotAvailable } from './errors.js'
import { Context, createIOInternal } from './io.internal.js'
import { createFakeServerFetch, newMemoryContext } from './io.mock.js'
import fetch from 'cross-fetch'

async function setupIOTest(context: Context = { fetch, importModule: importModuleStub }) {
	const sl = createStandardLogForTest()
	const log = sl.getLogger('test')
	const io = await createIOInternal(context, { url, log })
	return { io, reporter: sl.reporter }
}

describe(`loadConfig()`, () => {
	it(`throws ${ServerNotAvailable.name} when service is down`, async () => {
		const { io } = await setupIOTest()
		a.throws(io.loadConfig(), ServerNotAvailable)
	})

	it('returns config', async () => {
		const { io } = await setupIOTest(newMemoryContext())
		const config = await io.loadConfig()
		expect(config).toEqual({ ecmaVersion: 'es2015', plugins: [] })
	})
})

const importModuleStub = async () => {
	throw new Error('not supported')
}
const url = 'http://localhost:3698'

test('read not exist spec throws SpecNotFound', async () => {
	const fetch = createFakeServerFetch()
	const sl = createStandardLogForTest()
	const log = sl.getLogger('test')
	const io = await createIOInternal({ fetch, importModule: importModuleStub }, { url, log })

	await a.throws(io.readSpec('not exist', 'some-path/file'), SpecNotFound)
})

test('read existing spec', async () => {
	const fetch = createFakeServerFetch()
	const sl = createStandardLogForTest()
	const log = sl.getLogger('test')
	const io = await createIOInternal({ fetch, importModule: importModuleStub }, { url, log })

	const actual = await io.readSpec('exist', 'some-path/file')

	expect(actual).toEqual({ actions: [] })
})

test('write spec', async () => {
	const fetch = createFakeServerFetch()
	const sl = createStandardLogForTest()
	const log = sl.getLogger('test')
	const io = await createIOInternal({ fetch, importModule: importModuleStub }, { url, log })

	const record: SpecRecord = {
		refs: [],
		actions: [{ type: 'invoke', refId: '1', performer: 'user', thisArg: '0', payload: [], tick: 0 }]
	}
	await io.writeSpec('new spec', 'some-path/file', record)

	const spec = fetch.specs['new spec']
	expect(spec).toEqual(record)
})

describe('loadConfig()', () => {
	test('returns installed plugin', async () => {
		const fetch = createFakeServerFetch()
		const sl = createStandardLogForTest()
		const log = sl.getLogger('test')
		const io = await createIOInternal({ fetch, importModule: importModuleStub }, { url, log })

		const list = await (await io.loadConfig()).plugins
		expect(list).toEqual(['@mocktomata/plugin-fixture-dummy'])
	})
})

describe('loadPlugin()', () => {
	test('load existing plugin', async () => {
		const dummy = { activate() {} }
		const fetch = createFakeServerFetch()
		const sl = createStandardLogForTest()
		const log = sl.getLogger('test')
		const io = await createIOInternal({ fetch, importModule: () => Promise.resolve(dummy) }, { url, log })

		const p = await io.loadPlugin(`@mocktomata/plugin-fixture-dummy`)

		expect(p).toBe(dummy)
	})
})

// describe('loadConfig()', () => {
//   test('load...', async () => {
//     const io = await createClientIO()
//     await io.loadConfig()
//   })
// })
