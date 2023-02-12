import { createMemoryLogReporter, logLevels } from 'standard-log'
import { createLogContext } from './createLogContext.js'

it('defaults logLevel to debug if emitLog is true', () => {
	// this happens when emitLog is set at test level
	const { logLevel } = createLogContext({
		config: {},
		options: { emitLog: true },
		mode: 'auto',
		specName: 'a',
		reporter: createMemoryLogReporter()
	})
	expect(logLevel).toEqual(logLevels.debug)
})
