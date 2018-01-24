import { test } from 'ava'

import { spec } from '../index'

class Foo {
  constructor(public x) { }
  getValue() {
    return this.x
  }
}

test('simple class verify', async t => {
  const fooSpec = await spec(Foo)
  const foo = new fooSpec.subject(1)
  const actual = foo.getValue()
  t.is(actual, 1)
  await fooSpec.complete()

  await fooSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getValue' } },
    { type: 'class/return', payload: 1 }
  ])
})

test('simple class save', async t => {
  const fooSpec = await spec(Foo, { id: 'class/simple', mode: 'save' })
  const foo = new fooSpec.subject(1)
  const actual = foo.getValue()
  t.is(actual, 1)
  await fooSpec.complete()

  await fooSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getValue' } },
    { type: 'class/return', payload: 1 }
  ])
})

test('simple class verify', async t => {
  const fooSpec = await spec(Foo, { id: 'class/simple', mode: 'replay' })
  const foo = new fooSpec.subject(1)
  const actual = foo.getValue()
  t.is(actual, 1)
  await fooSpec.complete()

  await fooSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getValue' } },
    { type: 'class/return', payload: 1 }
  ])
})

class Boo extends Foo {
  getPlusOne() {
    return this.getValue() + 1
  }
}

test('extended class verify', async t => {
  const booSpec = await spec(Boo)
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.is(actual, 2)
  await booSpec.complete()
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 2 }
  ])
})

test('extended class save', async t => {
  const booSpec = await spec(Boo, { id: 'class/extend', mode: 'save' })
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.is(actual, 2)
  await booSpec.complete()
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 2 }
  ])
})

test('extended class replay', async t => {
  const booSpec = await spec(Boo, { id: 'class/extend', mode: 'replay' })
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.is(actual, 2)
  await booSpec.complete()
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 2 }
  ])
})

test('replay on not existing spec will spy instead (check log)', async t => {
  const booSpec = await spec(Boo, { id: 'class/notExist', mode: 'replay' })
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.is(actual, 2)
  await booSpec.complete()
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 2 }
  ])
})

test('replay on not matching spec will spy instead (check log)', async t => {
  const booSpec = await spec(Boo, { id: 'class/extend', mode: 'replay' })
  const boo = new booSpec.subject(2)
  const actual = boo.getPlusOne()

  t.is(actual, 3)
  await booSpec.complete()
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [2] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 3 }
  ])
})
