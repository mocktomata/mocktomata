import { a } from 'assertron'
import axios, { AxiosError } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { IsoError, SerializableConverter } from 'iso-error'
import webPlugin, { Conflict } from 'iso-error-web'
import { incubator } from 'mocktomata/plugins'
import { plugin } from './plugin.js'

beforeAll(() => {
	incubator.config({
		plugins: [plugin]
	})
})

incubator('mock get call status', (specName, spec) => {
	it(specName, async () => {
		const i = axios.create()
		const mock = new MockAdapter.default(i)
		mock.onGet().reply(409)
		const s = await spec(i)
		const err = await a.throws(s.get('http://api.mathjs.org/v4/?expr=2*(7-3)'))

		expect(err.message).toEqual('Request failed with status code 409')
		await spec.done()
	})
})

incubator('mock get failure with iso-error', (specName, spec) => {
	it(specName, async () => {
		const i = axios.create()

		const converter = new SerializableConverter()
		converter.addPlugin(webPlugin)

		const mock = new MockAdapter.default(i)
		mock.onGet().reply(409, { error: converter.toSerializable(new Conflict('name conflict')) })

		await spec(AxiosError)
		const s = await spec(i)

		const err = await a.throws<AxiosError>(s.get('http://api.mathjs.org/v4/?expr=2*(7-3)'))

		const cause = converter.fromSerializable((err.response as any).data.error)
		expect(cause).toBeInstanceOf(Conflict)
		expect(err.response!.status).toEqual(409)
		expect(err.message).toEqual('Request failed with status code 409')
		await spec.done()
	})
})

incubator('bad mock get failure with iso-error', (specName, spec) => {
	it(specName, async () => {
		const i = axios.create()

		const converter = new SerializableConverter()
		converter.addPlugin(webPlugin)

		const mock = new MockAdapter.default(i)
		mock.onGet().reply(409, { error: converter.toSerializable(new Conflict('name conflict')) })

		await spec(AxiosError)
		const s = await spec(i)

		const err = await a.throws<AxiosError>(s.get('http://api.mathjs.org/v4/?expr=2*(7-3)'))

		expect(err.response!.status).toEqual(409)
		expect(err.message).toEqual('Request failed with status code 409')
		const cause = converter.fromSerializable((err.response as any).data)
		expect(cause).toBeInstanceOf(IsoError)
		await spec.done()
	})
})
