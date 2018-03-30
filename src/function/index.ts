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

export const invokedWith = createExpectation('function', 'invoke')
export const returnedWith = createExpectation('function', 'return')
