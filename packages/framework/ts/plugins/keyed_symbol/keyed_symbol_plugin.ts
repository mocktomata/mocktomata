import { demetarize, metarize, SymbolMeta } from '../../spec/metarize.js'
import type { SpecPlugin } from '../../spec_plugin/types.js'

export const keyedSymbolPlugin: SpecPlugin<symbol, SymbolMeta> = {
	name: 'keyedSymbol',
	support: v => typeof v === 'symbol' && !!Symbol.keyFor(v),
	createSpy: ({ setMeta }, v) => {
		setMeta(metarize(v) as SymbolMeta)
		return v
	},
	createStub: (_, _v, meta) => demetarize(meta) as symbol
}
