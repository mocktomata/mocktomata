import type { SpecRecord } from '../spec_record/types.js'

const wellKnownSymbols = new Map<symbol, string>(
	Object.getOwnPropertyNames(Symbol)
		.filter((name) => typeof (Symbol as any)[name] === 'symbol')
		.map((name) => [(Symbol as any)[name], name])
)

/**
 * Converts property keys to and from the form saved in the record.
 *
 * Unique symbols cannot be recreated in another run,
 * so each one is numbered by the order it is first claimed in the spec.
 */
export function createPropertyKeyRegistry() {
	const uniqueSymbols: symbol[] = []

	/**
	 * Gets the record form of a key without claiming it.
	 * An unclaimed unique symbol gets the next number.
	 */
	function peek(key: SpecRecord.SupportedKeyTypes): SpecRecord.ActionKey {
		if (typeof key !== 'symbol') return key
		const registered = Symbol.keyFor(key)
		if (registered !== undefined) return { type: 'symbol', key: registered }
		const wellKnown = wellKnownSymbols.get(key)
		if (wellKnown !== undefined) return { type: 'symbol', wellKnown }
		const index = uniqueSymbols.indexOf(key)
		const unique = index >= 0 ? index : uniqueSymbols.length
		return key.description === undefined
			? { type: 'symbol', unique }
			: { type: 'symbol', unique, description: key.description }
	}

	return {
		peek,
		/**
		 * Gets the record form of a key, numbering it if it is a new unique symbol.
		 */
		claim(key: SpecRecord.SupportedKeyTypes): SpecRecord.ActionKey {
			const actionKey = peek(key)
			if (isUniqueSymbolKey(actionKey) && actionKey.unique === uniqueSymbols.length) {
				uniqueSymbols.push(key as symbol)
			}
			return actionKey
		},
		/**
		 * Gets the property key back from its record form.
		 * Returns `undefined` for a unique symbol that is not claimed yet.
		 */
		resolve(key: SpecRecord.ActionKey): SpecRecord.SupportedKeyTypes | undefined {
			if (typeof key !== 'object') return key
			if ('key' in key) return Symbol.for(key.key)
			if ('wellKnown' in key) return (Symbol as any)[key.wellKnown]
			return uniqueSymbols[key.unique]
		}
	}
}

export type PropertyKeyRegistry = ReturnType<typeof createPropertyKeyRegistry>

export function isMatchingKey(actual: SpecRecord.ActionKey, expected: SpecRecord.ActionKey) {
	if (typeof actual !== 'object' || typeof expected !== 'object') return actual === expected
	if ('key' in actual) return 'key' in expected && actual.key === expected.key
	if ('wellKnown' in actual) return 'wellKnown' in expected && actual.wellKnown === expected.wellKnown
	return 'unique' in expected && actual.unique === expected.unique && actual.description === expected.description
}

/**
 * Formats a key as a property accessor, such as `.foo` or `[Symbol.iterator]`.
 */
export function prettifyKey(key: SpecRecord.ActionKey) {
	if (typeof key !== 'object') return `.${key}`
	if ('key' in key) return `[Symbol.for(${key.key})]`
	if ('wellKnown' in key) return `[Symbol.${key.wellKnown}]`
	return `[Symbol(${key.description ?? ''})#${key.unique}]`
}

function isUniqueSymbolKey(key: SpecRecord.ActionKey): key is { type: 'symbol'; unique: number } {
	return typeof key === 'object' && 'unique' in key
}
