import type { SpecPlugin } from '../spec_plugin/types.js'

export const numberLoggerPlugin: SpecPlugin = {
	name: 'number-logger',
	support: s => typeof s === 'number',
	createSpy: ({ log }, s) => {
		log.info('log on number', s)
		return s
	},
	createStub: ({ log }, s) => {
		log.info('log on number', s)
		return s
	}
}
