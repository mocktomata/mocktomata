import { Registrar, SpecContext, PluginUtil, ReturnAction } from 'komondor-plugin'

import { spyFunction } from './getSpyFunction'
import { stubFunction } from './getStubFunction'

export function activate(registrar: Registrar) {
  registrar.register(
    'function',
    {
      getSpy: (context, subject, action) => spyFunction(context, registrar.util, subject, action),
      getStub: (context, subject) => stubFunction(context, registrar.util, subject),
      getReturnSpy: (context, subject, action) => {
        if (typeof subject !== 'function') return undefined
        return spyReturnFunction(context, registrar.util, subject, action)
      },
      getReturnStub: (context, action) => {
        if (action.meta.returnType !== 'function') return undefined
        return stubFunction(context, registrar.util, undefined)
      }
    }
  )
}

function spyReturnFunction(context: SpecContext, util: PluginUtil, subject: Function, action: ReturnAction) {
  return spyFunction(context, util, subject, action)
}
