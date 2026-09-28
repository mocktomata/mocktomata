import { incubator } from '../incubator/index.js'
import { createTestAxios } from '../test_artifacts/test_subjects.js'

afterAll(incubator.cleanup)

describe('maskValue(string)', () => {
	incubator.sequence(
		'works with complex object (axios)',
		{
			logLevel: Number.POSITIVE_INFINITY
		},
		(specName, { save, simulate }, reporter) => {
			it(specName, async () => {
				{
					save.maskValue('secret')
					const s = await save(createTestAxios())
					const r = await s('http://postman-echo.com/get?foo=secret')
					expect(r.data.args).toEqual({ foo: 'secret' })
					const record = await save.done()

					expect(record.actions.length).toBeLessThan(20)
					expect(reporter.getLogMessage()).not.toContain('secret')
				}
				{
					simulate.maskValue('secret')
					const s = await simulate(createTestAxios())
					const r = await s('http://postman-echo.com/get?foo=secret')
					expect(r.data.args).toEqual({ foo: '[masked]' })
					const record = await simulate.done()

					expect(record.actions.length).toBeLessThan(20)
					expect(reporter.getLogMessage()).not.toContain('secret')
				}
				// The `save` half makes a live request to postman-echo.com, so this one needs more
				// than the 5s default before the runner's network counts as a test failure.
			}, 30_000)
		}
	)
})
