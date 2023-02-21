import { newContext } from './context.js'

describe(`getContext()`, () => {
	it(`defaults url to http://localhost:3698`, () => {
		const { getContext } = newContext()
		const ctx = getContext()
		const x = ctx.stackFrame.getCallSites()
		console.info(x)
	})
})
