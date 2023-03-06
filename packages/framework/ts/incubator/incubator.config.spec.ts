import { a } from 'assertron'
import { some } from 'satisfier'
import { incubator } from './index.js'
import { numberLoggerPlugin } from './number_logger_plugin.mock.js'

describe('use number logger', () => {
	beforeAll(() =>
		incubator.config({
			plugins: [numberLoggerPlugin]
		})
	)

	incubator('the plugin is invoked', (specName, spec, reporter) => {
		test(specName, async () => {
			const s = await spec((x: number) => x)
			expect(s(2)).toBe(2)
			await spec.done()
			a.satisfies(reporter.getLogMessagesWithIdAndLevel(), some(/\(INFO\) log on number 2/))
		})
	})
})
