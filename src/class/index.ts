import { SpecContext, Registrar } from 'komondor-plugin'

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

function getSpy<T = any>(context: SpecContext, subject: T) {
  return spyClass(context, subject) as any
}

function getStub(context: SpecContext, subject: any): any {
  return stubClass(context, subject)
}
