// tslint:disable:triple-equals
import t from 'assert'

import { artifact, overruleArtifact, MissingArtifact, spec } from '.'
import { artifactKey } from './constants'

test('string', () => {
  const a = artifact('string', 'abc')
  t(a == 'abc')
  t(a[artifactKey])
})
test('number', () => {
  const a = artifact('number', 1)
  t(a == 1)
  t(a[artifactKey])
})

test('boolean', () => {
  const a = artifact('boolean', false)
  t(a == false)
  t(a[artifactKey])
})

test('simple obj', () => {
  const a = artifact('object', { a: 1 })
  t(a.a == 1)
  t(a[artifactKey])
  t(a.a[artifactKey])
})

test('array', () => {
  const a = artifact('array', ['a', 1, true])
  t(a[0] == 'a')
  t(a[1] == 1)
  t(a[2] == true)
  t.strictEqual(a[artifactKey], 'array')
  t.strictEqual(a[0][artifactKey], 'string')
  t.strictEqual(a[1][artifactKey], 'number')
  t.strictEqual(a[2][artifactKey], 'boolean')
})

test('function, although this should not be used.', () => {
  const a = artifact('function', () => 0)
  t(a[artifactKey])
})


test('obj with function, although this should not be used.', () => {
  const a = artifact('object with function', { foo() { return '' } })
  t(a[artifactKey])
  t(a.foo[artifactKey])
})

test('every property of an object is an artifact', () => {
  const a = artifact('complex object', {
    string: 'a.b.c',
    boolean: false,
    number: 0,
    array: [0, '', false],
    object: { b: 0 }
  })

  t(a.number == 0)
  t(a.string == 'a.b.c')
  t(a.boolean == false)
  t(a.array[0] == 0)
  t(a.array[0] == '')
  t(a.array[0] == false)
  t(a.object.b == 0)
  t.strictEqual(a[artifactKey], 'object')
  t.strictEqual(a.number[artifactKey], 'number')
  t.strictEqual(a.boolean[artifactKey], 'boolean')
  t.strictEqual(a.string[artifactKey], 'string')
  t.strictEqual(a.object[artifactKey], 'object')
  t.strictEqual(a.object.b[artifactKey], 'number')
  t.strictEqual(a.array[artifactKey], 'array')
  t.strictEqual(a.array[0][artifactKey], 'number')
  t.strictEqual(a.array[1][artifactKey], 'string')
  t.strictEqual(a.array[2][artifactKey], 'boolean')
})

test('no original will throw', () => {
  t.throws(() => artifact('not defined'), MissingArtifact)
})

test('id only will get defined artifact', () => {
  const expected = artifact('defining', { a: 1 })
  const actual = artifact('defining')
  t.strictEqual(actual, expected)
})

// When running tests in watch mode,
// changing artifact should take effect.
test('call artifact() again will override', () => {
  artifact('override', { a: 1 })
  const expected = artifact('override', { a: 2 })
  const actual = artifact('override')
  t(expected.a == 2)
  t.strictEqual(actual, expected)
})

test('overruleArtifact() will cause artifact() to get its value', () => {
  const expected = overruleArtifact('overrule', { a: 1 })
  const actual = artifact('overrule', { a: 2 })
  t.strictEqual(actual, expected)
})

test('pass to subject as original type', async () => {
  async function retainType(value) {
    const type = typeof value
    const a = artifact(`retain type (${type})`, value)
    const s = await spec(input => {
      t.strictEqual(typeof input, type)
      t.deepStrictEqual(input, value)
    })

    s.subject(a)
  }

  await retainType('10.0.0.1')
  await retainType(123)
  await retainType(false)
  await retainType(true)
  await retainType([1, 2, 'b'])
  await retainType({ a: 1, b: { c: 3 } })
})

test('pass to subject constructor as original', async () => {
  class Foo {
    constructor(public host: string) {
      t.strictEqual(typeof host, 'string')
    }

    connect() {
      return new Promise(a => {
        setTimeout(() => a(this.host), 10)
      })
    }
  }

  const a = artifact('retain type for class', { host: '1.2.3.4' })
  const s = await spec(Foo)
  const f = new s.subject(a.host)
  t.strictEqual(await f.connect(), '1.2.3.4')
})

test('pass to class method as original', async () => {
  class Foo {
    connect(host: string) {
      return new Promise(a => {
        setTimeout(() => a(host), 10)
      })
    }
  }

  const a = artifact('retain type for class method', { host: '1.2.3.4' })
  const s = await spec(Foo)
  const f = new s.subject()
  t.strictEqual(await f.connect(a.host), '1.2.3.4')
})
