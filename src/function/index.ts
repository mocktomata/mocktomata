import { Registrar } from 'komondor-plugin'

import { spyFunction } from './getSpyFunction'
import { stubFunction } from './getStubFunction'

export function activate(registrar: Registrar) {
  registrar.register(
    'function',
    {
      getSpy: (context, subject, action) => {
        if (typeof subject !== 'function') return undefined
        return spyFunction(context, registrar.util, subject, action)
      },
      getStub: (context, subject, action) => {
        if (subject && typeof subject !== 'function') return undefined
        if (action && action.meta.returnType !== 'function') return undefined
        return stubFunction(context, registrar.util, subject)
      }
    }
  )
}
