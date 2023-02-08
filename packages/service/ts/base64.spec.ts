import { atob, btoa } from './base64.js'

it('works full cycle', () => {
	const result = atob(btoa('hello world'))

	expect(result).toEqual('hello world')
})
