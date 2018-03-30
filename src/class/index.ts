import { Registrar, SpyContext, StubContext, createExpectation } from 'komondor-plugin'

import { spyClass } from './spyClass'
import { stubClass } from './stubClass'
import { isClass } from './isClass'

export function activate(registrar: Registrar) {
  registrar.register(
    'class',
    isClass,
    getSpy,
    getStub
  )
}

function getSpy<T = any>(context: SpyContext, subject: T) {
  return spyClass(context, subject) as any
}

function getStub(context: StubContext, subject: any): any {
  return stubClass(context, subject)
}

export const constructedWith = createExpectation('class', 'constructor')
export const methodInvokedWith = createExpectation('class', 'invoke')
