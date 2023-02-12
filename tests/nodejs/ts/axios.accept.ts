import type { AxiosInstance } from 'axios'
import axios from 'axios'
import { mockto } from 'mocktomata'

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

export class Calculator {
	constructor(private axios: AxiosInstance) {}

	async add(a: number, b: number) {
		const response = await this.axios.get(`http://api.mathjs.org/v4/?expr=${a}%2B${b}`)
		return response.data
	}
}
