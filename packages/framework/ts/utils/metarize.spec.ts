import { a } from 'assertron'
import { assertType } from 'type-plus'
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

it('object property is skipped', () => {
	testMetarize({
		subject: { a: '1', o: {} },
		metarized: { type: 'object', props: { a: '1' } },
		expected: { a: '1' }
	})
})

it('function property is skipped', () => {
	testMetarize({
		subject: { f: function () {} },
		metarized: { type: 'object', props: {} },
		expected: {}
	})
})

it('array property is skipped', () => {
	testMetarize({
		subject: { a: ['a'] },
		metarized: { type: 'object', props: {} },
		expected: {}
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
	expect(actual).toEqual(expected === undefined ? subject : expected)
}
