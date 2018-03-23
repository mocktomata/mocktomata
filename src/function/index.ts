import { Registrar } from 'komondor-plugin'

import { spyFunction } from './getSpyFunction'
import { stubFunction } from './getStubFunction'

export function activate(registrar: Registrar) {
  registrar.register(
    'function',
    {
      getSpy: (context, subject) => spyFunction(context, registrar.util, subject),
      getStub: (context, subject, id) => stubFunction(context, registrar.util, subject, id)
    }
  )
}
