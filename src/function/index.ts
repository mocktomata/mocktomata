import { Registrar, createExpectation } from 'komondor-plugin'

import { spyFunction } from './getSpyFunction'
import { stubFunction } from './getStubFunction'

export function activate(registrar: Registrar) {
  registrar.register(
    'function',
    subject => typeof subject === 'function',
    (context, subject) => {
      return spyFunction(context, subject)
    },
    (context, subject) => {
      return stubFunction(context, subject)
    }
  )
}

export function functionConstructed(meta?) {
  return { type: 'function', name: 'construct', meta }
}
export function functionInvoked(...args: any[]) {
  return { type: 'function', name: 'invoke', payload: args }
}
export const functionReturned = createExpectation('function', 'return')
export const functionThrown = createExpectation('function', 'throw')
