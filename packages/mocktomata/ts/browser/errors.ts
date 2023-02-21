import { MocktomataError } from '@mocktomata/framework'

export class NotConfigured extends MocktomataError {
	constructor() {
		super(`Need to call config() before use.`)
	}
}
