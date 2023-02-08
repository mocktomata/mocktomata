import axios from 'axios'
import { mockto } from 'mocktomata'
import { Calculator } from './Calculator.js'

afterAll(() => mockto.cleanup())

mockto('1 + 1 = 2', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec(axios)
		const calc = new Calculator(subject)
		const actual = await calc.add(1, 1)
		expect(actual).toBe(2)
		await spec.done()
	})
})
