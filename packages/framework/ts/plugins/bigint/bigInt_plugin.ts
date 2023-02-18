import { BigIntMeta, demetarize, metarize } from '../../spec/metarize.js'
import type { SpecPlugin } from '../../spec_plugin/types.js'

export const bigIntPlugin: SpecPlugin<bigint, BigIntMeta> = {
	name: 'bigint',
	support: v => typeof v === 'bigint',
	createSpy: ({ setMeta }, v) => {
		setMeta(metarize(v) as BigIntMeta)
		return v
	},
	createStub: (_, _v, meta) => demetarize(meta) as bigint
}
