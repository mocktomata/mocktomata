import type { SpecPlugin } from '../../spec_plugin/types.js'

export const nullPlugin: SpecPlugin<null> = {
	name: 'null',
	support: subject => subject === null,
	createSpy: ({ setMeta }) => (setMeta(null), null),
	createStub: () => null
}
