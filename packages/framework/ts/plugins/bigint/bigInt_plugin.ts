import type { SpecPlugin } from '../../spec_plugin/types.js'
import { type BigIntMeta, demetarize, metarize } from '../../utils/index.js'

export const bigIntPlugin: SpecPlugin<bigint, BigIntMeta> = {
	name: 'bigint',
	support: v => typeof v === 'bigint',
	createSpy: ({ setMeta }, v) => {
		setMeta(metarize(v))
		return v
	},
	createStub: (_, _v, meta) => demetarize(meta)
}
