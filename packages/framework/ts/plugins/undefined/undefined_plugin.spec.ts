import { undefinedPlugin } from './undefined_plugin.js'

test('support undefined', () => {
	expect(undefinedPlugin.support(undefined)).toBe(true)
})
