import 'cross-fetch/polyfill'
import { incubator } from './incubator/index.js'

incubator(`support headers`, { emitLog: true }, (specName, spec) => {
	it(specName, async () => {
		await spec(Response)
		await spec(Headers)
		await spec(Object)
		const subject = await spec(
			() =>
				new Response(null, {
					headers: new Headers({ a: 'abc' })
				})
		)
		const actual = subject().headers
		expect([...actual.keys()]).toEqual(['a'])
		await spec.done()
	})
})
