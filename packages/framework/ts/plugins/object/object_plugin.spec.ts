import { objectPlugin } from './object_plugin.js'
import { Dummy } from '../../test-artifacts/index.js'

test('does not support primitives', () => {
	expect(objectPlugin.support(1)).toBe(false)
	expect(objectPlugin.support(true)).toBe(false)
	expect(objectPlugin.support('a')).toBe(false)
	expect(objectPlugin.support(undefined)).toBe(false)
	expect(objectPlugin.support(null)).toBe(false)
})

test('supports object literal', () => {
	expect(objectPlugin.support({})).toBe(true)
	expect(objectPlugin.support({ a: 1 })).toBe(true)
})

test('not support class', () => {
	expect(objectPlugin.support(Dummy)).toBeFalsy()
})

test.skip('does not support empty class instance', () => {
	class Foo {}
	expect(objectPlugin.support(new Foo())).toBe(false)
})

test.todo('does not support class instance')
