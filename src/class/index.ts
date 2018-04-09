import { Registrar, SpyContext, StubContext } from 'komondor-plugin'

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

export function classConstructed(className: string, ...args: any[]) {
  return { type: 'class', name: 'construct', payload: args, meta: { className } }
}
export function classMethodInvoked(methodName: string, ...args: any[]) {
  return { type: 'class', name: 'invoke', payload: args, meta: { methodName } }
}
export function classMethodReturned(methodName: string, result?: any) {
  return { type: 'class', name: 'return', payload: result, meta: { methodName } }
}
export function classMethodThrown(methodName: string, err: any) {
  return { type: 'class', name: 'throw', payload: err, meta: { methodName } }
}
