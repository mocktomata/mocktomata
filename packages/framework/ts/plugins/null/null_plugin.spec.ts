import { nullPlugin } from './null_plugin.js'

test('support null', () => {
	expect(nullPlugin.support(null)).toBe(true)
})
