import { MocktomataError } from '@mocktomata/framework'
import { ModuleError } from 'iso-error'
export class ServiceNotAvailable extends MocktomataError {
	constructor(public url: string, options?: ModuleError.Options) {
		super(`Unable to connect to server at ${url}`, options)
	}
}
