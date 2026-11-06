import { createPropertyKeyRegistry, isMatchingKey, prettifyKey } from './property_key.js'

describe(`${createPropertyKeyRegistry.name}()`, () => {
	it('keeps string and number keys as is', () => {
		const keys = createPropertyKeyRegistry()
		expect(keys.claim('a')).toBe('a')
		expect(keys.claim(1)).toBe(1)
		expect(keys.resolve('a')).toBe('a')
	})

	it('saves a well-known symbol by name', () => {
		const keys = createPropertyKeyRegistry()
		expect(keys.claim(Symbol.iterator)).toEqual({ type: 'symbol', wellKnown: 'iterator' })
		expect(keys.claim(Symbol.asyncIterator)).toEqual({ type: 'symbol', wellKnown: 'asyncIterator' })
		expect(keys.resolve({ type: 'symbol', wellKnown: 'toPrimitive' })).toBe(Symbol.toPrimitive)
	})

	it('saves a registered symbol by key', () => {
		const keys = createPropertyKeyRegistry()
		expect(keys.claim(Symbol.for('abc'))).toEqual({ type: 'symbol', key: 'abc' })
		expect(keys.resolve({ type: 'symbol', key: 'abc' })).toBe(Symbol.for('abc'))
	})

	it('numbers unique symbols by the order they are claimed', () => {
		const keys = createPropertyKeyRegistry()
		const a = Symbol('a')
		const b = Symbol()
		expect(keys.claim(a)).toEqual({ type: 'symbol', unique: 0, description: 'a' })
		expect(keys.claim(b)).toEqual({ type: 'symbol', unique: 1 })
		expect(keys.claim(a)).toEqual({ type: 'symbol', unique: 0, description: 'a' })
		expect(keys.resolve({ type: 'symbol', unique: 1 })).toBe(b)
	})

	it('does not number a unique symbol on peek', () => {
		const keys = createPropertyKeyRegistry()
		const a = Symbol('a')
		const b = Symbol('b')
		expect(keys.peek(a)).toEqual({ type: 'symbol', unique: 0, description: 'a' })
		expect(keys.claim(b)).toEqual({ type: 'symbol', unique: 0, description: 'b' })
		expect(keys.peek(a)).toEqual({ type: 'symbol', unique: 1, description: 'a' })
		expect(keys.resolve({ type: 'symbol', unique: 1, description: 'a' })).toBeUndefined()
	})
})

describe(`${isMatchingKey.name}()`, () => {
	it('compares string and number keys by value', () => {
		expect(isMatchingKey('a', 'a')).toBe(true)
		expect(isMatchingKey('1', 1)).toBe(false)
	})
	it('does not match a symbol key to a string key', () => {
		expect(isMatchingKey({ type: 'symbol', key: 'a' }, 'a')).toBe(false)
		expect(isMatchingKey({ type: 'symbol', wellKnown: 'iterator' }, 'iterator')).toBe(false)
	})
	it('compares symbol keys by kind and value', () => {
		expect(isMatchingKey({ type: 'symbol', key: 'a' }, { type: 'symbol', key: 'a' })).toBe(true)
		expect(isMatchingKey({ type: 'symbol', key: 'a' }, { type: 'symbol', wellKnown: 'a' })).toBe(false)
		expect(isMatchingKey({ type: 'symbol', wellKnown: 'iterator' }, { type: 'symbol', wellKnown: 'iterator' })).toBe(
			true
		)
		expect(
			isMatchingKey({ type: 'symbol', unique: 0, description: 'a' }, { type: 'symbol', unique: 0, description: 'a' })
		).toBe(true)
		expect(
			isMatchingKey({ type: 'symbol', unique: 0, description: 'a' }, { type: 'symbol', unique: 0, description: 'b' })
		).toBe(false)
		expect(isMatchingKey({ type: 'symbol', unique: 0 }, { type: 'symbol', unique: 1 })).toBe(false)
	})
})

describe(`${prettifyKey.name}()`, () => {
	it('formats keys as accessors', () => {
		expect(prettifyKey('a')).toBe('.a')
		expect(prettifyKey({ type: 'symbol', wellKnown: 'iterator' })).toBe('[Symbol.iterator]')
		expect(prettifyKey({ type: 'symbol', key: 'abc' })).toBe('[Symbol.for(abc)]')
		expect(prettifyKey({ type: 'symbol', unique: 2, description: 'k' })).toBe('[Symbol(k)#2]')
	})
})
