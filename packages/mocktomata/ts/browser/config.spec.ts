import { a } from 'assertron'
import { CannotConfigAfterUsed } from '../index.js'
import { newConfigurator } from './config.js'

it('default url to localhost:3698', () => {
	const [getConfig] = newConfigurator()

	expect(getConfig().url).toEqual('http://localhost:3698')
})

it('specify url', () => {
	const [getConfig, config] = newConfigurator()
	config({ url: 'http://localhost:1234' })

	expect(getConfig().url).toEqual('http://localhost:1234')
})

it('default ecmaVersion to es2015', () => {
	const [getConfig] = newConfigurator()

	expect(getConfig().ecmaVersion).toEqual('es2015')
})

it('specify ecmaVersion', () => {
	const [getConfig, config] = newConfigurator()
	config({ ecmaVersion: 'es2020' })

	expect(getConfig().ecmaVersion).toEqual('es2020')
})

it('throws if calling config after getConfig', () => {
	// this prevents unexpected behavior as the `config()` call is too late.
	const [getConfig, config] = newConfigurator()
	getConfig()

	a.throws(() => config({}), CannotConfigAfterUsed)
})
