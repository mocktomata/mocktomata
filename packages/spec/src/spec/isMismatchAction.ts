import { createSatisfier, anything } from 'satisfier';
import { KeyTypes, reduceKey } from 'type-plus';
import { SpecAction } from './types';

export function isMismatchAction(actual: SpecAction, expected: SpecAction) {
  const expectation = createActionExpectation(expected)
  console.log(expectation)
  return !createSatisfier(expectation).test(actual)
}

function createActionExpectation(action: SpecAction) {
  return {
    ...action,
    payload: createExpectationValue(action.payload)
  }
}

function createExpectationValue(value: any): any {
  if (value === null) return anything
  if (Array.isArray(value)) return value.map(v => createExpectationValue(v))
  if (typeof value === 'object') {
    return reduceKey(value, (p, k: any) => {
      p[k] = createExpectationValue(value[k])
      return p
    }, {} as Record<KeyTypes, any>)
  }
  return value
}
