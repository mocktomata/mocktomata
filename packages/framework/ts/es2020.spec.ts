import { configurator, incubator } from './index.js'

beforeAll(() =>
	configurator.config({
		ecmaVersion: 'es2020'
	})
)

describe('bigint', () => {
	function giveBig() {
		return 9007199254740991n
	}
	incubator(`handles bigint as return value`, (specName, spec) => {
		it(specName, async () => {
			const s = await spec(giveBig)
			expect(s()).toEqual(9007199254740991n)
			await spec.done()
		})
	})

	function takeBig(value: bigint) {
		return value - 1n
	}

	incubator('handles bigint as input', (specName, spec) => {
		it(specName, async () => {
			const s = await spec(takeBig)
			expect(s(9007199254740991n)).toEqual(9007199254740990n)
			await spec.done()
		})
	})
})
