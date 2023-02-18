import type { SpecPlugin } from '../../spec_plugin/types.js'
import { demetarize, metarize } from '../../spec/metarize.js'

export const bigIntPlugin: SpecPlugin<bigint> = {
	name: 'bigint',
	support: v => typeof v === 'bigint',
	createSpy: ({ setMeta }, v) => {
		setMeta(metarize(v))
		return v
	},
	createStub: (_, _v, meta) => demetarize(meta)
}
