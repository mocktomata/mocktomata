import { incubator } from '@mocktomata/framework'
import fetch from 'node-fetch'

incubator('call echo with url string', (specName, spec) => {
	test(specName, async () => {
		const f = await spec(fetch.default)

		const response = await f('https://postman-echo.com/get?foo=foo1')
		const actual = (await response.json()) as { args: { foo: string } }

		expect(actual.args).toEqual({ foo: 'foo1' })
		await spec.done()
	})
})
