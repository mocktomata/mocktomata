import t from 'assert'

import { artifact, overruleArtifact, spec, MissingArtifact } from '.'
import { artifactKey } from './constants'

test('string', () => {
  const a = artifact('string', 'abc')
  t.equal(a, 'abc')
  t(a[artifactKey])
})
test('number', () => {
  const a = artifact('number', 1)
  t.equal(a, 1)
  t(a[artifactKey])
})

test('boolean', () => {
  const a = artifact('boolean', false)
  t.equal(a, false)
  t(a[artifactKey])
})

test('simple obj', () => {
  const a = artifact('object', { a: 1 })
  t.equal(a.a, 1)
  t(a[artifactKey])
  t(a.a[artifactKey])
})

test('array', () => {
  const a = artifact('array', ['a', 1, true])
  t.equal(a[0], 'a')
  t.equal(a[1], 1)
  t.equal(a[2], true)
  t.equal(a[artifactKey], 'array')
  t.equal(a[0][artifactKey], 'string')
  t.equal(a[1][artifactKey], 'number')
  t.equal(a[2][artifactKey], 'boolean')
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

  t.equal(a.number, 0)
  t.equal(a.string, 'a.b.c')
  t.equal(a.boolean, false)
  t.equal(a.array[0], 0)
  t.equal(a.array[0], '')
  t.equal(a.array[0], false)
  t.equal(a.object.b, 0)
  t.equal(a[artifactKey], 'object')
  t.equal(a.number[artifactKey], 'number')
  t.equal(a.boolean[artifactKey], 'boolean')
  t.equal(a.string[artifactKey], 'string')
  t.equal(a.object[artifactKey], 'object')
  t.equal(a.object.b[artifactKey], 'number')
  t.equal(a.array[artifactKey], 'array')
  t.equal(a.array[0][artifactKey], 'number')
  t.equal(a.array[1][artifactKey], 'string')
  t.equal(a.array[2][artifactKey], 'boolean')
})

test('no original will throw', () => {
  t.throws(() => artifact('not defined'), MissingArtifact)
})

test('id only will get defined artifact', () => {
  const expected = artifact('defining', { a: 1 })
  const actual = artifact('defining')
  t.equal(actual, expected)
})

// When running tests in watch mode,
// changing artifact should take effect.
test('call artifact() again will override', () => {
  artifact('override', { a: 1 })
  const expected = artifact('override', { a: 2 })
  const actual = artifact('override')
  t.equal(expected.a, 2)
  t.equal(actual, expected)
})

test('overruleArtifact() will cause artifact() to get its value', () => {
  const expected = overruleArtifact('overrule', { a: 1 })
  const actual = artifact('overrule', { a: 2 })
  t.equal(actual, expected)
})

export function echo(a, callback) {
  callback(a)
}

test('changes in artifact value is ignored in simulation', async () => {
  const server = artifact('server', { host: '127.0.0.1' })
  const s = await spec.save('artifact/echo', echo)
  let actualHost
  s.subject(server.host, host => actualHost = host)
  t.equal(actualHost, server.host)
  await s.done()

  const server2 = artifact('server', { host: '10.3.1.1' })
  const s2 = await spec.simulate('artifact/echo', echo)
  s2.subject(server2.host, host => actualHost = host)
  t.equal(actualHost, server.host)
})
