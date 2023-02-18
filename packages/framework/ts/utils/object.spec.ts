import { hasProperty } from './index.js'

describe(`${hasProperty.name}()`, () => {
	describe('string property', () => {
		test('no matching property', () => {
			expect(hasProperty({}, 'not-exist')).toBe(false)
		})

		test('has property in object literal', () => {
			expect(hasProperty({ a: 1 }, 'a')).toBe(true)
		})

		test('has property in object assigned function', () => {
			const subject = Object.assign(() => false, { a: 1 })
			expect(hasProperty(subject, 'a')).toBe(true)
		})

		class Foo {
			static b = 2
			a = 1
			foo() {}
		}

		test('has static property in class', () => {
			expect(hasProperty(Foo, 'b')).toBe(true)
		})

		test('has property in instance', () => {
			expect(hasProperty(new Foo(), 'a')).toBe(true)
		})

		test('has method in instance', () => {
			const subject = new Foo()
			expect(hasProperty(subject, 'foo')).toBe(true)
		})

		class Boo extends Foo {}

		test('has property in parent class', () => {
			expect(hasProperty(new Boo(), 'a')).toBe(true)
		})

		test('has method in parent class', () => {
			expect(hasProperty(new Boo(), 'foo')).toBe(true)
		})
	})
})
