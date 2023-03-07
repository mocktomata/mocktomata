import { a } from 'assertron'
import { assertType } from 'type-plus'
import { Dummy } from '../test_artifacts/test_subjects.js'
import { demetarize, metarize } from './metarize.js'

it('works with empty object', () => {
	testMetarize({
		subject: {},
		metarized: { type: 'object', props: {} }
	})
})

it('works with primitive values', () => {
	testMetarize({
		subject: true,
		metarized: true
	})

	testMetarize({
		subject: 0,
		metarized: 0
	})

	testMetarize({
		subject: 'abc',
		metarized: 'abc'
	})
	testMetarize({
		subject: null,
		metarized: null
	})
	testMetarize({
		subject: undefined,
		metarized: { type: 'undefined' }
	})
	testMetarize({
		subject: 9007199254740991n,
		metarized: { type: 'bigint', value: '9007199254740991' }
	})
})

it('works with symbol with description', () => {
	testMetarize({
		subject: Symbol.for('abc'),
		metarized: { type: 'symbol', key: 'abc' }
	})
})

it('throws when subject is symbol without description', () => {
	a.throws(() => metarize(Symbol()))
})

it('works with object with primitive values', () => {
	testMetarize({
		subject: {
			s: 'abc',
			b: false,
			num: 1,
			n: null
		},
		metarized: {
			type: 'object',
			props: {
				s: 'abc',
				b: false,
				num: 1,
				n: null
			}
		}
	})
})

it('object property is kept as empty object', () => {
	// The empty object is only used for keeping the key defined.
	// During simulation the plugin will return the actual value using `getProperty()`
	testMetarize({
		subject: { a: '1', o: {} },
		metarized: { type: 'object', props: { a: '1', o: {} } },
		expected: { a: '1', o: {} }
	})
})

it('kept function property as empty object', () => {
	// The empty object is only used for keeping the key defined.
	// During simulation the plugin will return the actual value using `getProperty()`
	testMetarize({
		subject: { f: function () {} },
		metarized: { type: 'object', props: { f: {} } },
		expected: { f: {} }
	})
})

it('kept array property as empty object', () => {
	// The empty object is only used for keeping the key defined.
	// During simulation the plugin will return the actual value using `getProperty()`
	testMetarize({
		subject: { a: ['a'] },
		metarized: { type: 'object', props: { a: {} } },
		expected: { a: {} }
	})
})

it('kept class property as empty object', () => {
	testMetarize({
		subject: { dummy: Dummy },
		metarized: { type: 'object', props: { dummy: {} } },
		expected: { dummy: {} }
	})
})

it('material class', () => {
	testMetarize({
		subject: Dummy,
		metarized: { type: 'function', length: 0, name: 'Dummy', props: {} },
		expected(actual: any) {
			expect(actual.name).toEqual('Dummy')
		}
	})
})

it('return type to never if M is not SpecMeta', () => {
	const r = metarize<any, { a: number }>({})
	assertType.isNever(r)
})

function testMetarize({
	subject,
	expected,
	metarized
}: {
	logLevel?: number
	subject: unknown
	expected?: any
	metarized?: any
}) {
	const meta = metarize(subject)
	if (metarized) {
		expect(meta).toEqual(metarized)
	}
	const actual = demetarize(meta)
	if (typeof expected === 'function') expected(actual)
	else {
		expect(actual).toEqual(expected === undefined ? subject : expected)
	}
}
