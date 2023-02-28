import { a } from 'assertron'
import { filename } from 'dirname-filename-esm'
import { relative } from 'node:path'
import { some } from 'satisfier'
import { logLevels } from 'standard-log'
import { createKomondor } from '../index.js'
import { createTestContext } from '../testing/index.js'
import { indirectKomondor } from './komondor.test-setup.js'

const k = createKomondor(createTestContext())

afterAll(() => k.cleanup())

describe(`kd.live()`, () => {
	it('can invoke with no options', async () => {
		const spec = k.live('live with no options')
		const s = await spec((x: number) => x + 1)
		expect(s(1)).toBe(2)
		await spec.done()
	})

	it('can specify timeout', async () => {
		const spec = k.live('live with options', { timeout: 2000 })
		const s = await spec((x: number) => x + 1)
		expect(s(1)).toBe(2)
		await spec.done()
	})

	it('can specify log level', async () => {
		const spec = k.live('live has enableLog method', { logLevel: logLevels.all })
		await spec(() => {})
	})
})

describe(`kd.save()`, () => {
	it('can invoke with no options', async () => {
		const spec = k.save('save with no options')
		const s = await spec((x: number) => x + 1)
		expect(s(1)).toBe(2)
		await spec.done()
	})

	it('can specify timeout', async () => {
		const spec = k.save('save with options', { timeout: 2000 })
		const s = await spec((x: number) => x + 1)
		expect(s(1)).toBe(2)
		await spec.done()
	})

	it('can specify log level', async () => {
		const spec = k.save('save has enableLog method', { logLevel: logLevels.debug })
		await spec(() => {})
		await spec.done()

		expect(spec.reporter.logs.length).toBe(1)
	})

	it('can specify specRelativePath for indirect usage', async () => {
		const { done, reporter } = indirectKomondor(k, 'indirect usage', {
			logLevel: Infinity,
			specRelativePath: relative(process.cwd(), filename(import.meta))
		})
		await done()
		// need to skip `ts/` and `.ts` from match.
		// jest run from `ts` or `esm` depends on it is `test:watch` vs `test` or `coverage`
		expect(reporter.getLogMessage()).toMatch('/komondor/komondor.spec')
	})
})

test('auto lifecycle', async () => {
	const save = k('auto lifecycle')
	await save({})
	expect(save.mode).toBe('save')
	await save.done()

	const simulate = k('auto lifecycle')
	await simulate({})
	expect(simulate.mode).toBe('simulate')
	await simulate.done()
})

it('gets memory log reporter', async () => {
	const save = k.save('gets memory log reporter', { logLevel: logLevels.all })

	const subject = { a: 1 }
	const spy = await save(subject)
	expect(spy.a).toBe(1)
	await save.done()

	a.satisfies(save.reporter.getLogMessagesWithIdAndLevel(), some(/^mocktomata:gets memory log reporter:save/))

	const simulate = k.simulate('gets memory log reporter', { logLevel: logLevels.all })
	const stub = await simulate(subject)
	expect(stub.a).toBe(1)
	await simulate.done()

	a.satisfies(
		simulate.reporter.getLogMessagesWithIdAndLevel(),
		some(/^mocktomata:gets memory log reporter:simulate/)
	)
})

describe(`kd.mock()`, () => {
	it(`requires to specify a mock`, async () => {
		const spec = k.mock('requires to specify a mock')
		const s = await spec((v: string) => v, { mock: () => 'stubbed' })
		const r = s('value')
		expect(r).toBe('stubbed')
	})
	it('direct accepts mock but ignore it', async () => {
		const spec = k('direct accepts mock but ignore it')
		const s = await spec((v: string) => v, { mock: () => 'stubbed' })
		const r = s('value')
		expect(r).toBe('value')
	})
	it('live accepts mock but ignore it', async () => {
		const spec = k.live('live accepts mock but ignore it')
		const s = await spec((v: string) => v, { mock: () => 'stubbed' })
		const r = s('value')
		expect(r).toBe('value')
	})
	it('save accepts mock but ignore it', async () => {
		const spec = k.save('save accepts mock but ignore it')
		const s = await spec((v: string) => v, { mock: () => 'stubbed' })
		const r = s('value')
		expect(r).toBe('value')
	})
	it('simulate accepts mock but ignore it', async () => {
		{
			const spec = k.save('simulate accepts mock but ignore it')
			const s = await spec((v: string) => v, { mock: () => 'stubbed' })
			const r = s('value')
			expect(r).toBe('value')
			await spec.done()
		}
		{
			const spec = k.simulate('simulate accepts mock but ignore it')
			const s = await spec((v: string) => v, { mock: () => 'stubbed' })
			const r = s('value')
			expect(r).toBe('value')
			await spec.done()
		}
	})
})
