import a from 'assertron'

import { createExpectation, createScopedCreateExpectation } from '.'

describe('createExpectation', () => {
  test('create with meta', () => {
    const s = createExpectation('node-fetch', 'invoke', { b: 1 })
    const expectation = s('payload', { a: 1 })
    a.satisfies({ type: 'node-fetch', name: 'invoke', payload: 'payload', meta: { a: 1, b: 1 } }, expectation)
  })
  test('can use expectation with meta', () => {
    const s = createExpectation('node-fetch', 'invoke')
    const expectation = s('payload', { a: 1 })
    a.satisfies({ type: 'node-fetch', name: 'invoke', payload: 'payload', meta: { a: 1 } }, expectation)
  })
  test('can use expectation without meta', () => {
    const s = createExpectation('node-fetch', 'invoke')
    const expectation = s('payload')
    a.satisfies({ type: 'node-fetch', name: 'invoke', payload: 'payload' }, expectation)
  })
})

describe('createScopedCreateExpectation', () => {
  test('create with meta', () => {
    const createSatisfier = createScopedCreateExpectation('x')
    const s = createSatisfier('node-fetch', 'invoke', { b: 1 })
    const expectation = s('payload', { a: 1 })
    a.satisfies({ type: 'x/node-fetch', name: 'invoke', payload: 'payload', meta: { a: 1, b: 1 } }, expectation)
  })
  test('create with meta', () => {
    const createSatisfier = createScopedCreateExpectation('x')
    const s = createSatisfier('node-fetch', 'invoke')
    const expectation = s('payload', { a: 1 })
    a.satisfies({ type: 'x/node-fetch', name: 'invoke', payload: 'payload', meta: { a: 1 } }, expectation)
  })
  test('meta is optional', () => {
    const createSatisfier = createScopedCreateExpectation('x')
    const s = createSatisfier('node-fetch', 'invoke')
    const expectation = s('payload')
    a.satisfies({ type: 'x/node-fetch', name: 'invoke', payload: 'payload' }, expectation)
  })
})

