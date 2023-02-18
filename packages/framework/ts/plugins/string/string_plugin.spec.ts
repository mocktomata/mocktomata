import { stringPlugin } from './string_plugin.js'

test('support string', () => {
	expect(stringPlugin.support('')).toBe(true)
	expect(stringPlugin.support(' ')).toBe(true)
	expect(stringPlugin.support(`abc`)).toBe(true)
})
