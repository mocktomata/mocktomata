import { bigIntPlugin } from './bigInt_plugin.js'

it('supports bigint', () => {
	expect(bigIntPlugin.support(9007199254740991n)).toBe(true)
})

it('does not support number', () => {
	expect(bigIntPlugin.support(0)).toBe(false)
	expect(bigIntPlugin.support(1)).toBe(false)
})
