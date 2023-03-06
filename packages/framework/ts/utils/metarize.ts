import { type AnyFunction, type AnyRecord, reduceByKey } from 'type-plus'

export type FunctionMeta = {
	type: 'function'
	name: string
	/**
	 * Number of arguments.
	 *
	 * This is not from JavaScript and it is actually not accurate.
	 * We keep track of it and restore it to keep the shape as consistent as possible
	 */
	length: number
	props: AnyRecord
}

export type BigIntMeta = {
	type: 'bigint'
	value: string
}

/**
 * Note only keyed symbol can be supported.
 *
 * There is no way to deserialize a non-keyed symbol.
 */
export type SymbolMeta = {
	type: 'symbol'
	key: string
}

export type UndefinedMeta = {
	type: 'undefined'
}

export type ArrayMeta = {
	type: 'array'
	props: AnyRecord
}

export type ObjectMeta = {
	type: 'object'
	props: AnyRecord
}

export type SpecMeta =
	| null
	| number
	| boolean
	| string
	| FunctionMeta
	| BigIntMeta
	| SymbolMeta
	| UndefinedMeta
	| ArrayMeta
	| ObjectMeta

/**
 * Metarize a value.
 *
 * A metarized value can be saved in the `SpecRecord`
 * and restore from it.
 *
 * This is a generic implementation.
 * Plugin can choose to use this implementation or create their own.
 */
// export function metarize(value: Record<string | number, any>): ObjectMeta
export function metarize<S = unknown, M = SpecMeta>(value: S): M extends SpecMeta ? M : never {
	switch (typeof value) {
		case 'function': {
			return {
				type: 'function',
				name: value.name,
				length: value.length,
				props: extractProps(value)
			} as any
		}
		case 'bigint': {
			return {
				type: 'bigint',
				value: value.toString()
			} as any
		}
		case 'symbol': {
			const key = Symbol.keyFor(value)
			if (!key) throw new Error('Cannot metarize symbol without key')
			return {
				type: 'symbol',
				key
			} as any
		}
		case 'undefined': {
			return {
				type: 'undefined'
			} as any
		}
		case 'object': {
			if (value === null) return value as any
			if (Array.isArray(value)) {
				return {
					type: 'array',
					props: extractProps(value)
				} as any
			} else {
				return {
					type: 'object',
					props: extractProps(value)
				} as any
			}
		}
		case 'number':
		case 'boolean':
		case 'string':
			return value as any
		// istanbul ignore next
		default: {
			console.warn(`unexpected meta type: ${typeof value}

Please open an issue at https://github.com/mocktomata/mocktomata/issues`)
			return value as any
		}
	}
}

/**
 * Convert a metarized value back to the original value.
 *
 * This is a generic implementation.
 * Plugin can choose to use this implementation or create their own.
 */
export function demetarize(metaObj: FunctionMeta): AnyFunction
export function demetarize(metaObj: BigIntMeta): bigint
export function demetarize(metaObj: SymbolMeta): symbol
export function demetarize(metaObj: UndefinedMeta): undefined
export function demetarize<T = any>(metaObj: ArrayMeta): T[]
export function demetarize(metaObj: ObjectMeta): Record<string | number, any>
export function demetarize<T extends null | number | boolean | string>(metaObj: T): T
export function demetarize(metaObj: SpecMeta): any
export function demetarize(metaObj: any) {
	if (metaObj === null || typeof metaObj !== 'object') return metaObj

	switch (metaObj.type) {
		case 'function': {
			const fnArgs = []
			for (let i = 0; i < metaObj.length; i++) fnArgs.push('arg' + i)
			fnArgs.push('') // function body
			const fn = new Function(...fnArgs)
			Object.defineProperty(fn, 'name', { value: metaObj.name })
			return Object.assign(fn, metaObj.props)
		}
		case 'bigint': {
			return BigInt(metaObj.value)
		}
		case 'symbol': {
			return Symbol.for(metaObj.key)
		}
		case 'undefined': {
			return undefined
		}
		case 'object':
		case 'array': {
			return metaObj.props
		}
		// istanbul ignore next
		default: {
			throw new Error(`not expected meta type: ${(metaObj as any)?.type ?? metaObj}`)
		}
	}
}

function extractProps(value: any) {
	return reduceByKey(
		value,
		(p, key) => {
			const descriptor = Object.getOwnPropertyDescriptor(value, key)!
			if (descriptor.enumerable) {
				if (
					descriptor.value === null ||
					(typeof descriptor.value !== 'object' && typeof descriptor.value !== 'function')
				) {
					p[key] = descriptor.value
				}
			}
			return p
		},
		{} as AnyRecord
	)
}
