import { isGeneratorFunction, hasPropertyInPrototype } from '../../utils/index.js'

export function isClass(subject: unknown) {
	if (typeof subject !== 'function') return false

	if (isGeneratorFunction(subject)) return false
	return hasPropertyInPrototype(subject)
}
