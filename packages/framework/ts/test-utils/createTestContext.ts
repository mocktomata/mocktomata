import { AsyncContext } from 'async-fp'
import { createMemoryLogReporter, createStandardLog, logLevels } from 'standard-log'
import { createColorLogReporter } from 'standard-log-color'
import { requiredDeep } from 'type-plus'
import { createConfigurator, resolveLogLevel } from '../config/index.js'
import { createTestIO } from './createTestIO.js'
export namespace createTestContext {
	export type Options = createTestIO.Options
}

export function createTestContext(options?: createTestContext.Options) {
	const o = requiredDeep(
		{
			config: {
				emitLog: false,
				logLevel: logLevels.debug
			}
		},
		options
	)
	const io = createTestIO(o)
	const reporter = createMemoryLogReporter()
	const reporters = o?.config?.emitLog ? [reporter, createColorLogReporter()] : [reporter]
	const logLevel = resolveLogLevel(o.config.logLevel)
	const sl = createStandardLog({ logLevel, reporters })
	const log = sl.getLogger('mocktomata')
	const configurator = createConfigurator()
	const context = new AsyncContext({ io, log, configurator })
	return { context, config: configurator.config, reporter }
}
