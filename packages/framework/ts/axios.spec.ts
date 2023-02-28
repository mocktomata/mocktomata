import axios from 'axios'
import { incubator } from './incubator/index.js'

describe(`request()`, () => {
	// ? Should this be valid case? is it possible that the save miss some get prop records?
	incubator.sequence(
		`can get request fn multiple times`,
		{ emitLog: true },
		(specName, { save, simulate }) => {
			it.skip(specName, async () => {
				{
					const a = await save(axios)
					expect(typeof a.request).toBe('function')
					await save.done()
				}
				{
					const a = await simulate(axios)
					expect(typeof a.request).toBe('function')
					expect(typeof a.request).toBe('function')
					expect(typeof a.request).toBe('function')
					await simulate.done()
				}
			})
		}
	)
})
