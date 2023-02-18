import type { SpecPlugin } from '../../spec_plugin/types.js'

export const undefinedPlugin: SpecPlugin<undefined, undefined> = {
	name: 'undefined',
	support: subject => typeof subject === 'undefined',
	createSpy: (_, subject) => subject,
	createStub: () => undefined
}
