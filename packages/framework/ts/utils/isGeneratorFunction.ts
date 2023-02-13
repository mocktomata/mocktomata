const GeneratorFunction = function* () {
	yield undefined
}.constructor

/**
 * This reported to work in node, chrome, and firefox.
 * Will see if additional work needs to be done.
 *
 * @see https://stackoverflow.com/questions/16754956/check-if-function-is-a-generator
 */
export function isGeneratorFunction(subject: unknown) {
	return subject instanceof GeneratorFunction
}
