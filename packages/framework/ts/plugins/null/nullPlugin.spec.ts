import { nullPlugin } from './nullPlugin.js'

test('support null', () => {
	expect(nullPlugin.support(null)).toBe(true)
})
