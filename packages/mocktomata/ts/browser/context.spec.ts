import { CannotConfigAfterUsed } from '@mocktomata/framework'
import { a } from 'assertron'
import { newContext } from './context.js'

describe(`getConfig()`, () => {
	it(`throws ${CannotConfigAfterUsed.name} after context is constructed.`, async () => {
		const { config, getContext } = newContext()
		await getContext().asyncContext.get()
		a.throws(config, CannotConfigAfterUsed)
	})
})

describe(`getContext()`, () => {
	it(`defaults url to http://localhost:3698`, async () => {
		const { getContext } = newContext()
		const r = await getContext().asyncContext.get()
		// able to read meaning it is reading from the service on port 3698
		expect(r.config.ecmaVersion).toEqual(`es2020`)
	})
})
