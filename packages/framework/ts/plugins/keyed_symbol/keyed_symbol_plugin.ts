import type { SpecPlugin } from '../../spec_plugin/types.js'
import { demetarize, metarize } from '../../spec/metarize.js'

export const keyedSymbolPlugin: SpecPlugin<bigint> = {
	name: 'keyedSymbol',
	support: v => typeof v === 'symbol' && !!Symbol.keyFor(v),
	createSpy: ({ setMeta }, v) => {
		setMeta(metarize(v))
		return v
	},
	createStub: (_, _v, meta) => demetarize(meta)
}
