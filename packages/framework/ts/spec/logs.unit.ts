import { logLevels } from 'standard-log'
import { incubator } from '../incubator/index.js'
import { increment } from '../test_artifacts/index.js'

incubator(
	'log action with trace when logLevel is planck',
	{ logLevel: logLevels.planck },
	(specName, spec, reporter) => {
		it(specName, async () => {
			const s = await spec(increment)
			const r = s(2)
			expect(r).toEqual(3)
			await spec.done()
			expect(reporter.getLogMessage()).toContain('logs.unit.')
		})
	}
)

incubator(
	'log action without trace when logLevel lower than planck',
	{ logLevel: logLevels.debug },
	(specName, spec, reporter) => {
		it(specName, async () => {
			const s = await spec(increment)
			const r = s(2)
			expect(r).toEqual(3)
			await spec.done()
			expect(reporter.getLogMessage()).not.toContain('logs.unit.')
		})
	}
)
