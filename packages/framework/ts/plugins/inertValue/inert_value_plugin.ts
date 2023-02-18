import type { SpecPlugin } from '../../spec-plugin/types.js'

// istanbul ignore next
export const inertPlugin: SpecPlugin<any> = {
	name: 'inert',
	support: () => false,
	createSpy: ({ setSpyOptions, setMeta }, v) => {
		setMeta(v)
		setSpyOptions(v, { inert: true })
		return v
	},
	createStub: (_, _v, meta) => meta
}
