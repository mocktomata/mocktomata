import { a } from 'assertron'
import { toMetaObj } from './metarize.ctx.js'
import { demetarize, metarize } from './metarize.js'

it('works with empty object', () => {
	testMetarize({
		subject: {},
		expectedMetaObj: { type: 'object', props: {} }
	})
})

it('works with primitive values', () => {
	testMetarize({
		subject: true,
		expectedMetaObj: true
	})

	testMetarize({
		subject: 0,
		expectedMetaObj: 0
	})

	testMetarize({
		subject: 'abc',
		expectedMetaObj: 'abc'
	})
	testMetarize({
		subject: null,
		expectedMetaObj: null
	})
	testMetarize({
		subject: undefined,
		expectedMetaObj: { type: 'undefined' }
	})
	testMetarize({
		subject: 9007199254740991n,
		expectedMetaObj: { type: 'bigint', value: '9007199254740991' }
	})
})

it('works with symbol with description', () => {
	testMetarize({
		subject: Symbol.for('abc'),
		expectedMetaObj: { type: 'symbol', key: 'abc' }
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
		expectedMetaObj: {
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
		expectedMetaObj: { type: 'object', props: { a: '1' } },
		expected: { a: '1' }
	})
})

it('function property is skipped', () => {
	testMetarize({
		subject: { f: function() {} },
		expectedMetaObj: { type: 'object', props: {} },
		expected: {}
	})
})
it('array property is skipped', () => {
	testMetarize({
		subject: { a: ['a'] },
		expectedMetaObj: { type: 'object', props: {} },
		expected: {}
	})
})

function testMetarize({
	subject,
	expected,
	expectedMetaObj,
	expectedMeta
}: {
	logLevel?: number
	subject: unknown
	expected?: any
	expectedMetaObj?: any
	expectedMeta?: string
}) {
	if (expectedMetaObj) {
		expect(toMetaObj(subject)).toEqual(expectedMetaObj)
	}
	const meta = metarize(subject)
	if (expectedMeta) {
		expect(meta).toEqual(expectedMeta)
	}
	const actual = demetarize(meta)
	expect(actual).toEqual(expected === undefined ? subject : expected)
}
