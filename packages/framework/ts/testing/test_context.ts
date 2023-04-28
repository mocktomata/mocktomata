import { AsyncContext } from 'async-fp'
import { createMemoryLogReporter, createStandardLog, logLevels } from 'standard-log'
import { createColorLogReporter } from 'standard-log-color'
import { requiredDeep } from 'type-plus'
import { createConfigurator, resolveLogLevel } from '../config/index.js'
import { createStackFrameContext } from '../stack_frame.js'
import { newMemoryIO } from '../memory_io.js'

export namespace createTestContext {
	export type Options = newMemoryIO.Options
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
	const io = newMemoryIO(o)
	const reporter = createMemoryLogReporter()
	const reporters = o?.config?.emitLog ? [reporter, createColorLogReporter()] : [reporter]
	const logLevel = resolveLogLevel(o.config.logLevel)
	const sl = createStandardLog({ logLevel, reporters })
	const log = sl.getLogger('mocktomata')
	const configurator = createConfigurator()
	const stackContext = createStackFrameContext({ cwd: process.cwd() })
	const context = new AsyncContext({ io, log, configurator, ...stackContext })
	return { context, config: configurator.config, reporter, ...stackContext }
}
