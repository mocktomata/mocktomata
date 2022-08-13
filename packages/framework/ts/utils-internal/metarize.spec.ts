import { metarize, demetarize } from './metarize.js'

test('empty object', () => {
  testMetarize({}, [{ type: 'object' }, {}], {})
})

test('object with primitive values', () => {
  testMetarize(
    { a: 'a', b: false, c: 1, d: null, e: undefined },
    [{ type: 'object' }, { a: 'a', b: false, c: 1, d: null, e: undefined }],
    { a: 'a', b: false, c: 1, d: null, e: undefined }
  )
})

test('object property is skipped', () => {
  testMetarize(
    { a: '1', o: {} },
    [{ type: 'object' }, { a: '1' }],
    { a: '1' }
  )
})

test('function property is skipped', () => {
  testMetarize(
    { f: function () { } },
    [{ type: 'object' }, {}],
    {}
  )
})

test('array property is skipped', () => {
  testMetarize(
    { a: ['a'] },
    [{ type: 'object' }, {}],
    {}
  )
})

test('empty function', () => {
  testMetarize(
    function () { },
    [{ type: 'function', name: '', length: 0 }, {}],
    function () { }
  )
})

test('arrow function', () => {
  testMetarize(
    () => { },
    [{ type: 'function', name: '', length: 0 }, {}],
    function () { }
  )
})

test('named function', () => {
  testMetarize(
    function foo() { },
    [{ type: 'function', name: 'foo', length: 0 }, {}],
    function foo() { }
  )
})

test('function with arguments', () => {
  testMetarize(
    function (_a: any, _b: any) { },
    [{ type: 'function', name: '', length: 2 }, {}],
    function (_c: any, _d: any) { },
  )
})

test('composite function', () => {
  testMetarize(
    Object.assign(function () { }, { a: 1 }),
    [{ type: 'function', name: '', length: 0 }, { a: 1 }],
    Object.assign(function () { }, { a: 1 }),
  )
})

function testMetarize(subject: any, expectedMeta: any, expected: any) {
  const meta = metarize(subject)
  expect(meta).toBe(JSON.stringify(expectedMeta))
  const result = demetarize(meta)
  if (typeof expected === 'function') {
    expect(typeof result).toBe('function')
    expect(result.name).toEqual(expected.name)
    expect(result.length).toEqual(expected.length)
  }
  else {
    expect(result).toEqual(expected)
  }
}
