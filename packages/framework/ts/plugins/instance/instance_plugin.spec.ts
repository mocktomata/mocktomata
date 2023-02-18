import { instancePlugin } from './instance_plugin.js'
import { Dummy } from '../../test-artifacts/index.js'

test('does not support primitive', () => {
	expect(instancePlugin.support(true)).toBe(false)
	expect(instancePlugin.support(1)).toBe(false)
	expect(instancePlugin.support('a')).toBe(false)
	expect(instancePlugin.support(null)).toBe(false)
	expect(instancePlugin.support(undefined)).toBe(false)
})

test('support class instance', () => {
	expect(instancePlugin.support(new Dummy())).toBe(true)
})

test('not support object literal', () => {
	expect(instancePlugin.support({})).toBe(false)
})
