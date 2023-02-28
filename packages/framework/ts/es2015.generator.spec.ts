import { incubator } from './incubator/index.js'

describe('generator', () => {
	function* foo() {
		yield 'a'
		yield 'b'
		yield 'c'
	}
	incubator('yield', (specName, spec) => {
		it(specName, async () => {
			const s = await spec(foo)
			const i = s()
			expect(i.next()).toEqual({ done: false, value: 'a' })
			expect(i.next()).toEqual({ done: false, value: 'b' })
			expect(i.next()).toEqual({ done: false, value: 'c' })
			await spec.done()
		})
	})
})
