import { createConfigurator, type Mocktomata } from '@mocktomata/framework'
import { createStackFrameContext } from '@mocktomata/framework/nodejs'
import { createIO } from '@mocktomata/nodejs'
import { AsyncContext } from 'async-fp'
import { createStandardLog, type Logger } from 'standard-log'
import { createColorLogReporter } from 'standard-log-color'

export function createContext(options?: { io?: Mocktomata.IO; log?: Logger }) {
	const configurator = createConfigurator()

	const cwd = process.cwd()
	const stackContext = createStackFrameContext(cwd)

	const context = new AsyncContext(() => {
		const log =
			options?.log || createStandardLog({ reporters: [createColorLogReporter()] }).getLogger('mocktomata')
		const io = options?.io || createIO({ cwd, log })
		return { io, log, configurator, ...stackContext }
	})

	return { context, config: configurator.config, ...stackContext }
}