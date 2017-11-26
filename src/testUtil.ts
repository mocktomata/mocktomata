import { formatFunction } from 'terse-format'

export function assertRegExp(t, actual, path, regex, actualValue) {
  t.is(actual.length, 1)
  t.deepEqual(actual[0].path, path)
  t.is(actual[0].expected.source, regex.source)
  t.deepEqual(actual[0].actual, actualValue)
}

export function assertExec(t, entry, path, expected, actual) {
  t.deepEqual(entry.path, path)
  if (typeof entry.expected === 'function')
    t.is(formatFunction(entry.expected, { maxLength: Infinity }), formatFunction(expected, { maxLength: Infinity }))
  else
    t.deepEqual(entry.expected, expected)
  t.deepEqual(entry.actual, actual)
}
