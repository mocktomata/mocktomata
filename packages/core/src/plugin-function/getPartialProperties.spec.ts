import t from 'assert';
import { getPartialProperties } from './getPartialProperties';

test('no properties returns undefined', () => {
  t.strictEqual(getPartialProperties(() => false), undefined)
  t.strictEqual(getPartialProperties(function () { return false }), undefined)
})

test('no properties returns undefined', () => {
  const actual = getPartialProperties(function () { return false })
  t.strictEqual(actual, undefined)
})

