import axios from 'axios'
import { incubator } from 'mocktomata/plugins'
import { plugin } from './plugin.js'

beforeAll(() => {
	incubator.config({
		plugins: [plugin]
	})
})

incubator('using headers', (specName, spec) => {
	it(specName, async () => {
		const s = await spec(axios)
		s.interceptors.request.use(r => {
			r.headers.set('Content-Type', 'application/json')
			return r
		})

		const r = await s.request({
			method: 'post',
			url: 'http://api.mathjs.org/v4/',
			data: {
				expr: '2*(7-3)'
			}
		})
		expect(r.data).toEqual({ error: null, result: '8' })
		await spec.done()
	})
})
