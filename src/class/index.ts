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

export const classConstructedWith = createExpectation('class', 'constructor')
export const classMethodInvokedWith = createExpectation('class', 'invoke')
export const classMethodReturnedWith = createExpectation('class', 'return')
export const classMethodThrownWith = createExpectation('class', 'throw')
