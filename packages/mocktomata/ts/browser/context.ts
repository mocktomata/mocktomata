import {
	buildConfig,
	CannotConfigAfterUsed,
	Config,
	createConfigurator,
	type Mocktomata
} from '@mocktomata/framework'
import { createStackFrameContext } from '@mocktomata/framework/nodejs'
import { createIO } from '@mocktomata/io-remote'
import { AsyncContext } from 'async-fp'
import { createStandardLog, type Logger } from 'standard-log'
import { createColorLogReporter } from 'standard-log-color'
import { requiredDeep, RequiredPick } from 'type-plus'

export function createContext(options?: { io?: Mocktomata.IO; log?: Logger }) {
	const configurator = createConfigurator()

	const cwd = process.cwd()
	const stackContext = createStackFrameContext(cwd)

	const context = new AsyncContext(async () => {
		const log =
			options?.log || createStandardLog({ reporters: [createColorLogReporter()] }).getLogger('mocktomata')
		const io = options?.io || (await createIO({ url: 'http://localhost:3698', log }))
		return { io, log, configurator, ...stackContext }
	})

	return { context, config: configurator.config, ...stackContext }
}

export type ConfigOptions = {
	/**
	 * Url of mocktomata service.
	 *
	 * By default, `@mocktomata/cli` starts the service at port 3698.
	 * So this url should set to `http://localhost:3698`
	 */
	url?: string
}

export function newContext() {
	let configOptions: RequiredPick<ConfigOptions, 'url'> = { url: 'http://localhost:3698' }
	let config: Config
	return {
		config(options: ConfigOptions) {
			if (config) throw new CannotConfigAfterUsed()
			configOptions = requiredDeep(configOptions, options)
		},
		/**
		 * getting the config for inspection
		 */
		getConfig() {
			return config
		},
		getContext() {
			const stackFrameContext = createStackFrameContext(configOptions.url)
			return {
				asyncContext: new AsyncContext(async () => {
					const log = createStandardLog({ reporters: [createColorLogReporter()] }).getLogger('mocktomata')
					const io = await createIO({ url: configOptions.url, log })
					config = buildConfig(await io.loadConfig())
					return { io, config, log, ...stackFrameContext }
				}),
				...stackFrameContext
			}
		}
	}
}
