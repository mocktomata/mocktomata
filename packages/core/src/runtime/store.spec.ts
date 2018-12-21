import t from 'assert'
import { store } from '.';

it('initial get returns default value', () => {
  const actual = store.get('get-with-default', { url: 'abc' })
  t.deepStrictEqual(actual, { url: 'abc' })
})

it('after set, the default value in get is ignored', () => {
  store.set('set-and-get', { a: 1 })
  const actual = store.get('set-and-get', { a: 2 })
  t.deepStrictEqual(actual, { a: 1 })
})

it('editing get object will be saved', () => {
  const subject = store.get('edit-get', { a: 1 })
  subject.a = 2

  const actual = store.get<{ a: number }>('edit-get')
  t.deepStrictEqual(actual, subject)
})
