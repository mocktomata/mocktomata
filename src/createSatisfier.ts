import { formatFunction } from 'function-formatter'

import { Struct, Expecter, SatisfierExec } from './interfaces'

/**
 * creates a satisfier
 * @param expected All properties can be a value which will be compared to the same property in `actual`, RegExp, or a predicate function that will be used to check against the property.
 */
export function createSatisfier<T extends Struct>(expected: Expecter<T>) {
  function test(actual: T) {
    return exec(actual) === null
  }
  /**
   * Check if `actual` satisfies the expected criteria.
   */
  function exec(actual: T) {
    if (Array.isArray(actual)) {
      const diff: SatisfierExec[] = []
      if (Array.isArray(expected)) {
        expected.forEach((e, i) => {
          diff.push(...detectDiff(actual[i], e, [`[${i}]`]))
        })
      }
      else {
        actual.forEach((a, i) => {
          diff.push(...detectDiff(a, expected, [`[${i}]`]))
        })
      }
      return diff.length === 0 ? null : diff
    }
    const diff = detectDiff(actual, expected)
    return diff.length === 0 ? null : diff
  }
  return {
    test,
    exec
  }
}

function detectDiff(actual, expected, path: string[] = []) {
  const diff: SatisfierExec[] = []
  const expectedType = typeof expected
  if (expectedType === 'function') {
    if (!(expected as Function)(actual)) {
      diff.push({
        path,
        expected: formatFunction(expected as Function),
        actual
      })
    }
  }
  else if (expectedType === 'boolean' || expectedType === 'number' || expectedType === 'string' || actual === undefined) {
    if (expected !== actual)
      diff.push({
        path,
        expected,
        actual
      })
  }
  else if (expected instanceof RegExp) {
    if (!expected.test(actual)) {
      diff.push({
        path,
        expected,
        actual
      })
    }
  }
  else if (Array.isArray(expected)) {
    expected.forEach((e, i) => {
      const actualValue = actual[i]
      diff.push(...detectDiff(actualValue, e, path.concat([`[${i}]`])))
    })
  }
  else
    Object.keys(expected).forEach(k => {
      diff.push(...detectDiff(actual[k], expected[k], path.concat([k])))
    })
  return diff
}
