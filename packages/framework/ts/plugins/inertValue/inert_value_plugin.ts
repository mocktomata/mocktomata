import type { SpecPlugin } from '../../spec_plugin/types.js'

/**
 * Inert value are values added to `ignoreMismatch()`
 */
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
