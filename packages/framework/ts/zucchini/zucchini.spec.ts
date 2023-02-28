import { a } from 'assertron'
import { filename } from 'dirname-filename-esm'
import t from 'node:assert'
import { relative } from 'node:path'
import { has, none } from 'satisfier'
import { logLevels } from 'standard-log'
import { IsEqual, isType } from 'type-plus'
import { createZucchini, SpecNotFound } from '../index.js'
import { createTestContext } from '../testing/index.js'
import { DuplicateStep, MissingStep } from './errors.js'
import { indirectZucchini } from './zucchini.test-setup.js'

describe(`${createZucchini.name}()`, () => {
	const { scenario, defineStep, defineParameterType } = createZucchini(createTestContext())
	afterAll(() => scenario.cleanup())
	describe(`${scenario.name}()`, () => {
		describe(`setup()`, () => {
			it('throws MissingStep if not defined', async () => {
				const { setup } = scenario('no handler')
				a.throws(() => setup('no setup handler'), MissingStep)
			})

			it('passes additional params to step', async () => {
				const { setup, done } = scenario('pass params')
				const actual: any[] = []
				defineStep('passing setup arguments', (_, ...inputs) => {
					actual.push(...inputs)
				})
				await setup('passing setup arguments', 1, 2, 3)
				t.deepStrictEqual(actual, [1, 2, 3])
				await done()
			})

			it('can call same setup step twice', async () => {
				defineStep('setupTwice', async ({ spec }, expected) => {
					const s = await spec(async () => expected)
					const actual = await s()

					t.strictEqual(actual, expected)
				})

				const save = scenario.save('call setup twice')
				await save.setup('setupTwice', 0)
				await save.setup('setupTwice', 2)
				await save.done()

				const sim = scenario.simulate('call setup twice')
				await sim.setup('setupTwice', 0)
				await sim.setup('setupTwice', 2)
				await sim.done()
			})

			it('passes template value to hander before additional params', async () => {
				const values: any[] = []
				defineStep('setup template {number} {word}', (_, id, code, ...inputs) => {
					values.push(id, code, ...inputs)
				})
				const { setup } = scenario('setup with template')
				await setup('setup template 123 abc', 'x')
				t.deepStrictEqual(values, [123, 'abc', 'x'])
			})

			it('passes clause to the context', async () => {
				defineStep('return clause {int}', async ({ clause }) => clause)

				const { setup } = scenario('passes clause to the context')

				const actual = await setup('return clause 234')
				t.strictEqual(actual, 'return clause 234')
			})

			it('saves the spec within the step', async () => {
				let count = 0
				defineStep('entropy', async ({ spec }) => {
					const s = await spec(() => count++)
					return s()
				})

				const save = scenario.save('setup spec is saved')
				expect(await save.setup('entropy')).toEqual(0)
				await save.done()

				const sim = scenario.simulate('setup spec is saved')
				expect(await sim.setup('entropy')).toEqual(0)
				await sim.done()
			})

			it('emits warning when the step throws', async () => {
				defineStep('throw step', () => {
					throw new Error('foo')
				})
				const { setup, reporter } = scenario('throwing setup will pass and emit warning')
				await setup('throw step')
				a.satisfies(
					reporter.logs,
					has({
						id: 'mocktomata:throwing setup will pass and emit warning:auto',
						level: logLevels.warn,
						args: [
							`scenario(throwing setup will pass and emit warning)
- setup(throw step) throws, is it safe to ignore?

Error: foo`
						]
					})
				)
			})

			it('can specify the return type', async () => {
				defineStep('return number {int}', async (_, value) => Number(value))

				const { setup } = scenario('passes clause to the context')

				const actual = await setup<number>('return number 234')
				t.strictEqual(actual, 234)
			})
		})

		describe(`run()`, () => {
			const { scenario, defineStep } = createZucchini(createTestContext())
			afterAll(() => scenario.cleanup())
			it('throws MissingStep if not defined', async () => {
				const { run } = scenario('no handler')
				await a.throws(() => run('no setup handler'), MissingStep)
			})

			it('passes additional params to step', async () => {
				const { run, done } = scenario('pass params')
				const actual: any[] = []
				defineStep('passing run arguments', (_, ...inputs) => {
					actual.push(...inputs)
				})
				await run('passing run arguments', 1, 2, 3)
				t.deepStrictEqual(actual, [1, 2, 3])
				await done()
			})

			it('saves the spec within the step', async () => {
				let count = 0
				defineStep('entropy', async ({ spec }) => {
					const s = await spec(() => count++)
					return s()
				})

				const save = scenario.save('run spec is saved')
				expect(await save.run('entropy')).toEqual(0)
				await save.done()

				const sim = scenario.simulate('run spec is saved')
				expect(await sim.run('entropy')).toEqual(0)
				await sim.done()
			})
		})

		describe('spec()', () => {
			it('is working as expected', async () => {
				const save = scenario('increment')
				let s = await save.spec((x: number) => x + 1)
				isType.t<IsEqual<typeof s, (x: number) => number>>()
				expect(s(1)).toBe(2)
				expect(save.mode()).toEqual('save')
				await save.done()

				const simulate = scenario('increment')
				s = await simulate.spec((x: number) => x + 1)
				expect(s(1)).toBe(2)
				expect(simulate.mode()).toEqual('simulate')
				await simulate.done()
			})
		})

		describe('.live()', () => {
			it('can be called without option', () => {
				scenario.live('live with no options')
			})
		})

		describe('.save()', () => {
			it('can be called without option', () => {
				scenario.save('save with no options')
			})
		})

		describe('.simulate()', () => {
			it('can be called without option', () => {
				scenario.simulate('simulate with no options')
			})
		})

		describe(`teardown()`, () => {
			const { scenario, defineStep } = createZucchini(createTestContext())
			afterAll(() => scenario.cleanup())
			it('throws MissingStep if not defined', async () => {
				const { teardown } = scenario('no handler')
				a.throws(() => teardown('no teardown handler'), MissingStep)
			})

			it('passes additional params to step', async () => {
				const { teardown, done } = scenario('pass params')
				const actual: any[] = []
				defineStep('passing teardown arguments', (_, ...inputs) => {
					actual.push(...inputs)
				})
				await teardown('passing teardown arguments', 1, 2, 3)
				t.deepStrictEqual(actual, [1, 2, 3])
				await done()
			})

			it('can call same teardown step twice', async () => {
				defineStep('setupTwice', async ({ spec }, expected) => {
					const s = await spec(async () => expected)
					const actual = await s()

					t.strictEqual(actual, expected)
				})

				const save = scenario.save('call teardown twice')
				await save.teardown('setupTwice', 0)
				await save.teardown('setupTwice', 2)
				await save.done()

				const sim = scenario.simulate('call teardown twice')
				await sim.teardown('setupTwice', 0)
				await sim.teardown('setupTwice', 2)
				await sim.done()
			})

			it('passes template value to hander before additional params', async () => {
				const values: any[] = []
				defineStep('teardown template {number} {word}', (_, id, code, ...inputs) => {
					values.push(id, code, ...inputs)
				})
				const { teardown } = scenario('teardown with template')
				await teardown('teardown template 123 abc', 'x')
				t.deepStrictEqual(values, [123, 'abc', 'x'])
			})

			it('passes clause to the context', async () => {
				defineStep('return clause {int}', async ({ clause }) => clause)

				const { teardown } = scenario('passes clause to the context')

				const actual = await teardown('return clause 234')
				t.strictEqual(actual, 'return clause 234')
			})

			it('saves the spec within the step', async () => {
				let count = 0
				defineStep('entropy', async ({ spec }) => {
					const s = await spec(() => count++)
					return s()
				})

				const save = scenario.save('teardown spec is saved')
				expect(await save.teardown('entropy')).toEqual(0)
				await save.done()

				const sim = scenario.simulate('teardown spec is saved')
				expect(await sim.teardown('entropy')).toEqual(0)
				await sim.done()
			})

			it('emits warning when the step throws', async () => {
				defineStep('throw step', () => {
					throw new Error('foo')
				})
				const { teardown, reporter } = scenario('throwing teardown will pass and emit warning')
				await teardown('throw step')
				a.satisfies(
					reporter.logs,
					has({
						id: 'mocktomata:throwing teardown will pass and emit warning:auto',
						level: logLevels.warn,
						args: [
							`scenario(throwing teardown will pass and emit warning)
- teardown(throw step) throws, is it safe to ignore?

Error: foo`
						]
					})
				)
			})
		})

		describe(`ensure()`, () => {
			const { scenario, defineStep } = createZucchini(createTestContext())
			afterAll(() => scenario.cleanup())
			it('throws MissingStep if not defined', async () => {
				const { ensure } = scenario('no handler')
				a.throws(() => ensure('no ensure handler'), MissingStep)
			})

			it('passes additional params to step', async () => {
				const { ensure, done } = scenario('pass params')
				const actual: any[] = []
				defineStep('passing ensure arguments', (_, ...inputs) => {
					actual.push(...inputs)
				})
				await ensure('passing ensure arguments', 1, 2, 3)
				t.deepStrictEqual(actual, [1, 2, 3])
				await done()
			})

			it('can call same ensure step twice', async () => {
				defineStep('setupTwice', async ({ spec }, expected) => {
					const s = await spec(async () => expected)
					const actual = await s()

					t.strictEqual(actual, expected)
				})

				const save = scenario.save('call ensure twice')
				await save.ensure('setupTwice', 0)
				await save.ensure('setupTwice', 2)
				await save.done()

				const sim = scenario.simulate('call ensure twice')
				await sim.ensure('setupTwice', 0)
				await sim.ensure('setupTwice', 2)
				await sim.done()
			})

			it('passes template value to hander before additional params', async () => {
				const values: any[] = []
				defineStep('ensure template {number} {word}', (_, id, code, ...inputs) => {
					values.push(id, code, ...inputs)
				})
				const { ensure } = scenario('ensure with template')
				await ensure('ensure template 123 abc', 'x')
				t.deepStrictEqual(values, [123, 'abc', 'x'])
			})

			it('passes clause to the context', async () => {
				defineStep('return clause {int}', async ({ clause }) => clause)

				const { ensure } = scenario('passes clause to the context')

				const actual = await ensure('return clause 234')
				t.strictEqual(actual, 'return clause 234')
			})

			it('saves the spec within the step', async () => {
				let count = 0
				defineStep('entropy', async ({ spec }) => {
					const s = await spec(() => count++)
					return s()
				})

				const save = scenario.save('ensure spec is saved')
				expect(await save.ensure('entropy')).toEqual(0)
				await save.done()

				const sim = scenario.simulate('ensure spec is saved')
				expect(await sim.ensure('entropy')).toEqual(0)
				await sim.done()
			})

			it('will not emits warning when the step throws', async () => {
				defineStep('throw step', () => {
					throw new Error('foo')
				})
				const { ensure, reporter } = scenario('throwing ensure will pass and emit warning')
				await ensure('throw step')
				a.satisfies(
					reporter.logs,
					none({
						id: 'mocktomata:throwing ensure will pass and emit warning:auto',
						level: logLevels.warn,
						args: [
							`scenario(throwing ensure will pass and emit warning)
  - ensure(throw step) throws, is it safe to ignore?

  Error: foo`
						]
					})
				)
			})
		})

		it('can specify specRelativePath for indirect usage', async () => {
			const { done, reporter } = indirectZucchini(scenario, 'indirect usage', {
				logLevel: Infinity,
				specRelativePath: relative(process.cwd(), filename(import.meta))
			})
			await done()
			// need to skip `ts/` and `.ts` from match.
			// jest run from `ts` or `esm` depends on it is `test:watch` vs `test` or `coverage`
			expect(reporter.getLogMessage()).toMatch('/zucchini/zucchini.spec')
		})
	})

	describe(`${defineStep.name}()`, () => {
		it('can be called multiple times with the same arguments', () => {
			const handler = () => {}
			defineStep('same handler', handler)
			defineStep('same handler', handler)
		})

		it('throws DuplicateStep if the step is defined twice', () => {
			defineStep('a', () => 1)
			a.throws(() => defineStep('a', () => 2), DuplicateStep)

			defineStep(/abc/, () => 3)
			a.throws(() => defineStep(/abc/, () => 4), DuplicateStep)
		})

		it('does not throw DuplicateStep if it is the same handler', () => {
			function handler() {}
			defineStep('same ref', handler)
			defineStep('same ref', handler)
		})

		it('does not throw DuplicateStep if the handler is identical', () => {
			// `vitest` (and may be `jest` too) can load the ESM module file twice,
			// in two different worker which share scope.
			// Resulting the `defineStep()` is called twice with different handler reference.
			const h1 = function handler() {}
			const h2 = function handler() {}
			defineStep('same ref', h1)
			defineStep('same ref', h2)
		})

		it('can define step with arguments', async () => {
			defineStep(`step with {}`, (_, arg) => arg + 1)

			const { run } = scenario('template with argument')
			const result = await run('step with 2')
			expect(result).toEqual(`21`)
		})

		it('can specify argument type as number', async () => {
			defineStep(`step arg as number {number}`, (_, arg) => arg + 1)

			const { run } = scenario('template with argument')
			const result = await run('step arg as number 2')
			expect(result).toEqual(3)
		})

		it('can specify argument type as float', async () => {
			defineStep(`step arg as float {float}`, (_, arg) => arg + 1)

			const { run } = scenario('template with argument')
			const result = await run('step arg as float 2.1')
			expect(result).toEqual(3.1)
		})

		it('can specify argument type as boolean', async () => {
			defineStep(`step arg as boolean {boolean}`, (_, arg) => arg)

			const { run } = scenario('template with argument')
			expect(await run('step arg as boolean true')).toEqual(true)
			expect(await run('step arg as boolean false')).toEqual(false)
		})

		it('works with multiple params template', async () => {
			const values: any[] = []
			defineStep(`two regex {word} {int} throws`, (_, a, b) => {
				values.push({ a, b })
			})
			const { setup } = scenario('setup with regex template')
			await setup('two regex b 123 throws')
			a.satisfies(values, [{ a: 'b', b: 123 }])
		})

		it('can specify clause as regex', async () => {
			defineStep(/clause in regex/, (_, arg) => arg + 1)

			const { run } = scenario('template with argument')
			const result = await run('clause in regex', 1)
			expect(result).toEqual(2)
		})

		it('gets args from regex group', async () => {
			defineStep(/add (\d+) \+ (\d+)/, (_, a, b) => a + b)

			const { run } = scenario('regex with groups')
			const result = await run('add 2 + 3')
			expect(result).toEqual(5)
		})

		it('can run sub step', async () => {
			defineStep('run leaf step {number}', async ({ spec }, step) => {
				const s = await spec(() => Promise.resolve(`leaf ${step}`))
				return await s()
			})

			defineStep('run substep {number}', async ({ spec, runSubStep }, step) => {
				const leaf = await runSubStep(`run leaf step ${step}`)
				const s = await spec(() => Promise.resolve(`substep ${step}`))
				const sub = await s()
				return `${sub} > ${leaf}`
			})
			defineStep('run with substep {number}', async ({ spec, runSubStep }, step) => {
				const sub = await runSubStep(`run substep ${step}`)
				const s = await spec(() => `first substep ${step}`)
				const first = await s()
				return `${first} > ${sub}`
			})
			const save = scenario('sub step')
			expect(await save.run('run with substep 1')).toEqual('first substep 1 > substep 1 > leaf 1')
			expect(await save.teardown('run with substep 2')).toEqual(`first substep 2 > substep 2 > leaf 2`)
			await save.done()

			const sim = scenario('sub step')
			expect(await sim.run('run with substep 1')).toEqual('first substep 1 > substep 1 > leaf 1')
			expect(await sim.teardown('run with substep 2')).toEqual(`first substep 2 > substep 2 > leaf 2`)
			await sim.done()
		})
	})

	describe(`${defineParameterType.name}()`, () => {
		it('define enum and regex type', async () => {
			defineParameterType({
				name: 'method',
				regexp: /(GET|POST|PUT|DELETE)/
			})
			defineParameterType({
				name: 'uri',
				regexp: /[\w./?=]*/
			})
			const mm: any[] = []
			defineStep(`{method} {uri} throws`, (_, method, uri) => {
				mm.push(method, uri)
			})

			const { setup } = scenario('define enum and regex type')

			await setup('GET some/url/1.0/resources?a=b throws')
			t.strictEqual(mm[0], 'GET')
			t.strictEqual(mm[1], 'some/url/1.0/resources?a=b')
		})
	})

	describe(`scenario.save()`, () => {
		const { scenario, defineStep } = createZucchini(createTestContext())
		afterAll(() => scenario.cleanup())
		it('forces save', async () => {
			let count = 0
			defineStep('entropy', async ({ spec }) => {
				const s = await spec(() => count++)
				return s()
			})

			const s = scenario('forces save')
			expect(await s.setup('entropy')).toEqual(0)
			await s.done()

			const save = scenario.save('forces save')
			expect(await save.setup('entropy')).toEqual(1)
			await save.done()

			const sim = scenario('forces save')
			expect(await sim.setup('entropy')).toEqual(1)
			await sim.done()
		})
	})

	describe(`scenario.simulate()`, () => {
		const { scenario } = createZucchini(createTestContext())
		afterAll(() => scenario.cleanup())
		it('forces simulate', async () => {
			const { spec } = scenario.simulate('forces simulate')
			a.throws(() => spec({}), SpecNotFound)
		})
	})

	describe('mocking', () => {
		it(`requires to specify a mock`, async () => {
			const { spec } = scenario.mock('requires to specify a mock')
			const s = await spec((v: string) => v, { mock: () => 'stubbed' })
			const r = s('value')
			expect(r).toBe('stubbed')
		})
		it('direct accepts mock but ignore it', async () => {
			const { spec } = scenario('direct accepts mock but ignore it')
			const s = await spec((v: string) => v, { mock: () => 'stubbed' })
			const r = s('value')
			expect(r).toBe('value')
		})

		it('live accepts mock but ignore it', async () => {
			const { spec } = scenario.live('live accepts mock but ignore it')
			const s = await spec((v: string) => v, { mock: () => 'stubbed' })
			const r = s('value')
			expect(r).toBe('value')
		})
		it('save/sim accepts mock but ignore it', async () => {
			{
				const { spec, done } = scenario.save('save accepts mock but ignore it')
				const s = await spec((v: string) => v, { mock: () => 'stubbed' })
				const r = s('value')
				expect(r).toBe('value')
				await done()
			}
			{
				const { spec, done } = scenario.simulate('save accepts mock but ignore it')
				const s = await spec((v: string) => v, { mock: () => 'stubbed' })
				const r = s('value')
				expect(r).toBe('value')
				await done()
			}
		})
	})
})
