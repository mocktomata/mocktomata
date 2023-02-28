import { buildConfig, Config, createConfigurator, createStackFrameContext, type Mocktomata } from '@mocktomata/framework'
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

export function newContext() {
	let configOptions: Config.Input = {}
	return {
		config(options: Config.Input) {
			configOptions = options
		},
		/**
		 * getting the config for inspection
		 */
		getConfig() {
			return configOptions
		},
		getContext() {
			const cwd = process.cwd()
			const stackFrameContext = createStackFrameContext(cwd)

			return {
				asyncContext: new AsyncContext(async () => {
					const log = createStandardLog({ reporters: [createColorLogReporter()] }).getLogger('mocktomata')
					const io = await createIO({ cwd, log })
					const config = buildConfig(await io.loadConfig(), configOptions)
					return { io, config, log, ...stackFrameContext }
				}),
				...stackFrameContext
			}
		}
	}
}
