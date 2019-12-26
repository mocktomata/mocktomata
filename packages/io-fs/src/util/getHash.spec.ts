import t from 'assert';
import { getHash } from './getHash';

test('accepts empty string as id', () => {
  const actual = getHash('')
  is32CharString(actual)
})

test('accepts unique code', () => {
  const actual = getHash('中文')
  is32CharString(actual)
})

function is32CharString(actual: string) {
  t(/\w{32}/.test(actual))
}
