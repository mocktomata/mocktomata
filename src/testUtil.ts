export function assertRegExp(t, actual, path, regex, actualValue) {
  t.is(actual.length, 1)
  t.deepEqual(actual[0].path, path)
  t.is(actual[0].expected.source, regex.source)
  t.deepEqual(actual[0].actual, actualValue)
}

export function assertExec(t, entry, path, expected, actual) {
  t.deepEqual(entry.path, path)
  t.deepEqual(entry.expected, expected)
  t.deepEqual(entry.actual, actual)
}
