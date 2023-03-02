import { CannotConfigAfterUsed } from '@mocktomata/framework'

export type Options = {
	url?: string
	ecmaVersion?: 'es2015' | 'es2020'
	plugins?: string[]
}

export function newConfigurator() {
	const options: Options = {
		ecmaVersion: 'es2015',
		url: 'http://localhost:3698'
	}
	let getCalled = false
	return [
		function getConfig() {
			getCalled = true
			return options
		},
		function config(input: Options) {
			if (getCalled) throw new CannotConfigAfterUsed()
			if (input.url) options.url = input.url
			if (input.ecmaVersion) options.ecmaVersion = input.ecmaVersion
		}
	] as const
}
