import { reduceByKey } from 'type-plus'

/**
 * Converts the value to a meta object for serialization.
 *
 * @note this is a internal function exposed for testing
 */
export function toMetaObj(value: unknown): any {
	switch (typeof value) {
		case 'function': {
			return {
				type: 'function',
				name: value.name,
				length: value.length,
				props: extractProps(value)
			}
		}
		case 'bigint': {
			return {
				type: 'bigint',
				value: value.toString()
			}
		}
		case 'symbol': {
			const key = Symbol.keyFor(value)
			if (!key) throw new Error('Cannot metarize symbol without key')
			return {
				type: 'symbol',
				key
			}
		}
		case 'undefined': {
			return {
				type: 'undefined'
			}
		}
		case 'object': {
			if (value === null) return value
			if (Array.isArray(value)) {
				return {
					type: 'array',
					props: extractArrayProps(value),
					items: value.map(toMetaObj)
				}
			} else {
				return {
					type: 'object',
					props: extractProps(value)
				}
			}
		}
		default:
			return value
	}
}
export function fromMetaObj(metaObj: any) {
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
		case 'object': {
			return metaObj.props
		}
		case 'array': {
			const a = metaObj.items.map(fromMetaObj)
			return Object.assign(a, metaObj.props)
		}
		default: {
			throw new Error(`not expected meta type: ${metaObj.type}`)
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
		{} as any
	)
}

function extractArrayProps(value: any) {
	return extractProps(value)
}
