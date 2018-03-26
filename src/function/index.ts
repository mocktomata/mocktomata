import { Registrar, createScopedCreateExpectation } from 'komondor-plugin'

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

const createExpectation = createScopedCreateExpectation('function')

export const invokedWith = createExpectation('invoke')
export const returnedWith = createExpectation('return')
