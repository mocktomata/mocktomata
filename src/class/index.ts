import { Registrar, SpyContext, StubContext, createScopedCreateExpectation } from 'komondor-plugin'

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

const createExpectation = createScopedCreateExpectation('class')

export const constructedWith = createExpectation('constructor')
export const methodInvokedWith = createExpectation('invoke')
