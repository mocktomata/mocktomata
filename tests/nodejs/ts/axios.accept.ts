import { a } from 'assertron'
import type { AxiosError, AxiosInstance } from 'axios'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { IsoError, SerializableConverter } from 'iso-error'
import googlePlugin from 'iso-error-google-cloud-api'
import { createHttpError, HttpError } from 'iso-error-web'
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

describe(`with axios-mock-adaptor`, () => {
	mockto('throws with cause', (specName, spec) => {
		it(specName, async () => {
			const mock = new MockAdapter.default(axios)
			mock.onGet().reply(424, {
				code: 5,
				details: [
					{
						'@type': 'google-cloud-api/CauseInfo',
						causes: [],
						message: 'not found'
					}
				],
				message: 'not found'
			})
			const converter = new SerializableConverter()
			converter.addPlugin(googlePlugin)
			axios.interceptors.response.use(undefined, (error: AxiosError) => {
				const cause = converter.fromSerializable(error.response?.data as any)
				throw createHttpError(error.response!.status, 'fail?', { cause })
			})
			await spec(HttpError)
			const s = await spec(axios)
			const err = await a.throws(s.get(`http://api.mathjs.org/v4/?expr=1%2B2`), HttpError)
			expect(err.message).toBe('fail?')
			expect(err.status).toBe(424)
			expect(err.cause).toBeInstanceOf(IsoError)
			expect(err.cause?.message).toBe('not found')
			await spec.done()
		})
	})
})
