import { Registrar } from 'komondor-plugin'

import { spyFunction } from './getSpyFunction'
import { stubFunction } from './getStubFunction'

export function activate(registrar: Registrar) {
  registrar.register(
    'function',
    subject => typeof subject === 'function',
    (context, subject, action) => {
      return spyFunction(context, subject, action)
    },
    (context, subject, _action) => {
      return stubFunction(context, subject)
    }
  )
}
