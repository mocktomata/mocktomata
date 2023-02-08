import {
	AmbiguousConfig,
	ConfigHasUnrecognizedProperties,
	ConfigPropertyMismatch,
	InvalidConfigFormat
} from './errors.js'

describe(`${InvalidConfigFormat.name}()`, () => {
	test('message', () => {
		const e = new InvalidConfigFormat('mocktomata.js')
		expect(e.message).toEqual(`The file 'mocktomata.js' does not contain a valid configuration`)
	})
})

describe(`${AmbiguousConfig.name}()`, () => {
	test('message', () => {
		const e = new AmbiguousConfig(['package.json', 'mocktomata.json'])
		expect(e.message).toEqual(`Multiple configuration detected. Please consolidate to one config.

configs:
- package.json
- mocktomata.json`)
	})
})

describe(`${ConfigPropertyMismatch.name}()`, () => {
	test('message', () => {
		const e = new ConfigPropertyMismatch('package.json', 'logLevel', 'debug', 'MOCKTOMATA_LOG', 'info')

		expect(e.message).toEqual(`The property value mismatch:

- logLevel (from 'package.json'): debug
- MOCKTOMATA_LOG: info`)
	})
})

describe(`${ConfigHasUnrecognizedProperties.name}()`, () => {
	test('message', () => {
		const e = new ConfigHasUnrecognizedProperties('package.json', {
			abc: 1,
			def: 'abc'
		})
		expect(e.message).toEqual(`The config in 'package.json' contains unrecognized properties:

- abc: 1
- def: abc`)
	})
})
