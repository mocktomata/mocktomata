import { Registrar } from 'komondor-plugin'
import { spyFunction } from './getSpyFunction';
import { stubFunction } from './getStubFunction';

export function activate(registrar: Registrar) {
  registrar.register(
    'function',
    subject => typeof subject === 'function',
    (context, subject) => {
      return spyFunction(context, subject)
    },
    (context, subject, action) => {
      return stubFunction(context, subject, action)
    }
  )
}
