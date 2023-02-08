import { undefinedPlugin } from './undefinedPlugin.js'

test('support undefined', () => {
	expect(undefinedPlugin.support(undefined)).toBe(true)
})
