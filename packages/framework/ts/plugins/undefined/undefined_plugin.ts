import type { SpecPlugin } from '../../spec_plugin/types.js'

export const undefinedPlugin: SpecPlugin<string> = {
	name: 'undefined',
	support: subject => typeof subject === 'undefined',
	createSpy: (_, subject) => subject,
	createStub: (_, _subject, meta) => meta
}
