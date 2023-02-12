import { hasPropertyInPrototype } from '../../utils/index.js'

export function isClass(subject: unknown) {
	return typeof subject === 'function' && hasPropertyInPrototype(subject)
}

