import { Mocktomata, SpecNotFound, type SpecRecord } from '@mocktomata/framework'
import dummy from '@mocktomata/plugin-fixture-dummy'
import { a } from 'assertron'
import fetch from 'cross-fetch'
import { createStandardLogForTest } from 'standard-log/testing'
import { ServiceNotAvailable } from './errors.js'
import { Context, createIOInternal } from './io.internal.js'
import { newMemoryContext } from './io.mock.js'
import { importModule } from './platform.js'

const importModuleStub = async () => {
	throw new Error('not supported')
}
const url = 'http://localhost:3789'

async function setupIOTest(context: Context = { fetch, importModule: importModuleStub }) {
	const sl = createStandardLogForTest()
	const log = sl.getLogger('test')
	const io = await createIOInternal(context, { url, log })
	return { io, reporter: sl.reporter }
}

let io: Mocktomata.IO

beforeAll(async () => {
	const sl = createStandardLogForTest()
	const log = sl.getLogger('test')
	io = await createIOInternal({ fetch, importModule }, { url, log })
})

it(`throws ${ServiceNotAvailable.name} when service is down`, async () => {
	const { io } = await setupIOTest()
	a.throws(io.loadConfig(), ServiceNotAvailable)
})

describe(`loadConfig()`, () => {
	it('returns config', async () => {
		const { io } = await setupIOTest(newMemoryContext())
		const config = await io.loadConfig()
		expect(config).toEqual({ ecmaVersion: 'es2015', plugins: [] })
	})

	it('returns config (live)', async () => {
		const config = await io.loadConfig()
		expect(config).toEqual({
			plugins: ['@mocktomata/plugin-fixture-dummy']
		})
	})
})

describe(`readSpec()`, () => {
	it(`throws SpecNotFound if the spec does not exist`, async () => {
		await a.throws(io.readSpec('not exist', 'some-path/file'), SpecNotFound)
	})
})

describe(`writeSpec()`, () => {
	it('writes spec', async () => {
		const record: SpecRecord = {
			refs: [],
			actions: [{ type: 'invoke', refId: '1', performer: 'user', thisArg: '0', payload: [], tick: 0 }]
		}
		await io.writeSpec('new spec', 'some-path/file', record)

		const spec = await io.readSpec('new spec', 'some-path/file')
		expect(spec).toEqual(record)
	})
})

// This is not ready.
// Need to figure out how to serve modules from hapi.
describe('loadPlugin()', () => {
	it.skip('loads defined plugin', async () => {
		const p = await io.loadPlugin(`@mocktomata/plugin-fixture-dummy`)

		expect(p).toEqual(dummy)
	})
})
