import { inertPlugin } from './inert_value_plugin.js'

test('does not support any value', () => {
	expect(inertPlugin.support(0)).toBe(false)
	expect(inertPlugin.support(1)).toBe(false)
	expect(inertPlugin.support(true)).toBe(false)
	expect(inertPlugin.support(false)).toBe(false)
})
