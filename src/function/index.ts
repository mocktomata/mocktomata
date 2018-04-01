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
    (context) => {
      return stubFunction(context)
    }
  )
}

export const functionInvokedWith = createExpectation('function', 'invoke')
export const functionReturnedWith = createExpectation('function', 'return')
export const functionThrownWith = createExpectation('function', 'throw')
