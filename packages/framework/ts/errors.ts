import { ModuleError } from 'iso-error'

export class MocktomataError extends ModuleError {
	constructor(description: string, options?: ModuleError.Options) {
		super('mocktomata', description, options)
	}
}
