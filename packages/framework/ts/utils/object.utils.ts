import type { SpecRecord } from '../spec-record/types.js'

export function isBaseObject(value: any) {
	return value === null || (value.__proto__ === null && value.constructor.name === 'Object')
}

/**
 * Does the subject any any property in its prototype
 */
export function hasPropertyInPrototype(subject: any) {
	let proto = subject.prototype
	while (proto !== undefined && proto !== Object.prototype) {
		const nextProto = Object.getPrototypeOf(proto)

		// if `nextProto` is null,
		// proto is the base `{ constructor, __defineGetter__, ... }`
		if (nextProto === null) return false

		// made a reasonable tradeoff assuming there will be at least one method in the class.
		// after all, there will be nothing to spy/stub if there is no method.
		if (Object.getOwnPropertyNames(proto).some(p => p !== 'constructor')) return true
		proto = nextProto
	}
	return false
}

/**
 * Does the subject has the specified property.
 */
export function hasProperty(subject: any, property: SpecRecord.SupportedKeyTypes): boolean {
	if (typeof property === 'string') {
		const propNames = Object.getOwnPropertyNames(subject)
		if (propNames.indexOf(property) >= 0) return true

		const proto = Object.getPrototypeOf(subject)
		return proto ? hasProperty(proto, property) : false
	}
	return false
}
