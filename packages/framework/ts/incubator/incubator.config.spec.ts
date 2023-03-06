import { decrementPlugin } from './decrement_plugin.mock.js'
import { incrementPlugin } from './increment_plugin.mock.js'
import { incubator } from './index.js'

beforeAll(() =>
	incubator.config({
		plugins: [incrementPlugin]
	})
)

describe('use increment', () => {
	incubator('increment plugin is loaded', (specName, spec) => {
		test(specName, async () => {
			const s = await spec((x: number) => x)
			expect(s(1)).toBe(2)

			await spec.done()
		})
	})
})

describe('use decrement', () => {
	beforeAll(() =>
		incubator.config({
			plugins: [decrementPlugin]
		})
	)

	// can't find a way to hack in the AsyncContext protection! :)
	incubator('call config again replaces the plugins', (specName, spec) => {
		test(specName, async () => {
			const s = await spec((x: number) => x)
			expect(s(2)).toBe(1)
			await spec.done()
		})
	})
})
