import { beforeAll, it } from '@jest/globals'
import axios from 'axios'
import { incubator } from 'mocktomata/plugins'
import { plugin } from './plugin.js'

beforeAll(() => {
	incubator.config({
		plugins: [plugin]
	})
})

incubator('skip interceptor calls in axiosInstance', (specName, spec) => {
	it(specName, async () => {
		const s = await spec(axios.create())
		s.interceptors.request.use(value => value)
		s.interceptors.response.use(value => value)
		const r = await s.request({ url: 'http://api.mathjs.org/v4/?expr=2*(7-3)' })
		expect(r.data).toBe(8)
		await spec.done()
	})
})

incubator('skip interceptor calls in axios', (specName, spec) => {
	it(specName, async () => {
		const s = await spec(axios)
		s.interceptors.request.use(value => value)
		s.interceptors.response.use(value => value)
		const r = await s.request({ url: 'http://api.mathjs.org/v4/?expr=2*(7-3)' })
		expect(r.data).toBe(8)
		await spec.done()
	})
})
