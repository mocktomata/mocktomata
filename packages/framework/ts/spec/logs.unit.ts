import { logLevels } from 'standard-log'
import { incubator } from '../index.js'
import { increment } from '../test_artifacts/index.js'

incubator('log action with trace', { logLevel: logLevels.planck }, (specName, spec, reporter) => {
	it(specName, async () => {
		const s = await spec(increment)
		const r = s(2)
		expect(r).toEqual(3)
		await spec.done()
		expect(reporter.getLogMessage()).not.toContain('ts/spec.logs')
	})
})
