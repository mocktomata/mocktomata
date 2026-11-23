import { a } from 'assertron'
import { incubator } from './incubator/index.js'
import { ActionMismatch } from './spec/errors.js'

afterAll(() => incubator.cleanup())

// `ignoreMismatch()` promises to ignore the value,
// so every use of the value of this run matches the recorded one, not only the first.
describe('ignoreMismatch(value): a changed value used more than once', () => {
	for (const argumentMatching of ['behavior', 'strings'] as const) {
		incubator.sequence(
			`${argumentMatching}: the value of this run passed to two calls matches both`,
			{ argumentMatching },
			(specName, { save, simulate }) => {
				test(specName, async () => {
					const subject = { create: (id: string) => id.length, get: (id: string) => `user ${id}` }
					save.ignoreMismatch('id-1')
					const spy = await save(subject)
					expect(spy.create('id-1')).toBe(4)
					expect(spy.get('id-1')).toBe('user id-1')
					await save.done()

					simulate.ignoreMismatch('id-22')
					const stub = await simulate(subject)
					expect(stub.create('id-22')).toBe(4)
					expect(stub.get('id-22')).toBe('user id-1')
					await simulate.done()
				})
			}
		)
	}

	incubator.sequence('a number passed to the same function twice matches both', (specName, { save, simulate }) => {
		test(specName, async () => {
			const echo = (x: number) => x
			save.ignoreMismatch(1001)
			const spy = await save(echo)
			spy(1001)
			spy(1001)
			await save.done()

			simulate.ignoreMismatch(2002)
			const stub = await simulate(echo)
			// the recorded value is still returned
			expect(stub(2002)).toBe(1001)
			expect(stub(2002)).toBe(1001)
			await simulate.done()
		})
	})

	incubator.sequence(
		'the value of this run passed to new and then a call matches both',
		(specName, { save, simulate }) => {
			test(specName, async () => {
				class Store {
					constructor(public id: number) {}
					has(id: number) {
						return id === this.id
					}
				}
				save.ignoreMismatch(1001)
				const Spy = await save(Store)
				expect(new Spy(1001).has(1001)).toBe(true)
				await save.done()

				simulate.ignoreMismatch(2002)
				const Stub = await simulate(Store)
				expect(new Stub(2002).has(2002)).toBe(true)
				await simulate.done()
			})
		}
	)

	incubator.sequence('another value in the second use still throws', (specName, { save, simulate }) => {
		test(specName, async () => {
			const echo = (x: number) => x
			save.ignoreMismatch(1001)
			const spy = await save(echo)
			spy(1001)
			spy(1001)
			await save.done()

			simulate.ignoreMismatch(2002)
			const stub = await simulate(echo)
			stub(2002)
			a.throws(() => stub(3003), ActionMismatch)
		})
	})

	incubator.sequence(
		'a value of this run not passed to ignoreMismatch() does not stand for the recorded value',
		(specName, { save, simulate }) => {
			test(specName, async () => {
				const echo = (x: number) => x
				save.ignoreMismatch(1001)
				const spy = await save(echo)
				spy(1001)
				spy(1001)
				await save.done()

				simulate.ignoreMismatch(3003)
				const stub = await simulate(echo)
				// the first use takes the place of the recorded value, as it does today
				stub(2002)
				a.throws(() => stub(2002), ActionMismatch)
			})
		}
	)

	incubator.sequence(
		'a value of another type does not stand for the recorded value',
		(specName, { save, simulate }) => {
			test(specName, async () => {
				const echo = (x: unknown) => x
				save.ignoreMismatch(1001)
				const spy = await save(echo)
				spy(1001)
				spy(1001)
				await save.done()

				simulate.ignoreMismatch('1001')
				const stub = await simulate(echo)
				stub('1001')
				a.throws(() => stub('1001'), ActionMismatch)
			})
		}
	)
})
