import type { SpecPlugin } from '../../spec_plugin/types.js'

export const stringPlugin: SpecPlugin<string, string> = {
	name: 'string',
	support: subject => typeof subject === 'string',
	createSpy: ({ setMeta }, subject) => {
		setMeta(subject)
		return subject
	},
	createStub: (_, _subject, meta) => {
		return meta
	}
}
