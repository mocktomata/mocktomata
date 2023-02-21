import { createConfigurator, type Mocktomata } from '@mocktomata/framework'
import { createStackFrameContext } from '@mocktomata/framework/nodejs'
import { createIO } from '@mocktomata/io-remote'
import { AsyncContext } from 'async-fp'
import { createStandardLog, type Logger } from 'standard-log'
import { createColorLogReporter } from 'standard-log-color'
import { requiredDeep, RequiredPick } from 'type-plus'
import { NotConfigured } from './errors.js'

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
	return {
		config(options: ConfigOptions) {
			configOptions = requiredDeep(configOptions, options)
		},
		getContext() {
			if (!configOptions) throw new NotConfigured()

			const context = {
				...createStackFrameContext(configOptions.url)
			}

			return context
		}
	}
}
