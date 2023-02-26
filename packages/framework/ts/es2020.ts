import { es2015 } from './es2015.js'
import { bigIntPlugin } from './plugins/bigint/bigInt_plugin.js'
import type { SpecPlugin } from './spec_plugin/types.js'

export const es2020 = {
	name: '@mocktomata',
	activate({ register }: SpecPlugin.ActivationContext) {
		es2015.activate({ register })
		register(bigIntPlugin)
	}
}
