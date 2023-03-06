import axios from 'axios'
import { incubator } from 'mocktomata/plugins'

incubator('using headers', (specName, spec) => {
	it(specName, async () => {
		const s = await spec(axios)
		const r = await s.request({
			method: 'post',
			url: 'http://api.mathjs.org/v4/',
			headers: {
				'Content-Type': 'application/json'
			},
			data: {
				expr: '2*(7-3)'
			}
		})
		expect(r.data).toEqual({ error: null, result: '8' })
		await spec.done()
	})
})
