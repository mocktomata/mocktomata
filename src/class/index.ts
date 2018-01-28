import { SpecContext, SpecPluginUtil, KomondorRegistrar } from '../index'

import { spyClass } from './spyClass'
import { stubClass } from './stubClass'

let komondorUtil: SpecPluginUtil

export function activate(registrar: KomondorRegistrar, util: SpecPluginUtil) {
  komondorUtil = util
  registrar.registerGetSpy(getSpy)
  registrar.registerGetStub(getStub)
}

function getSpy<T = any>(context: SpecContext, subject: T) {
  if (!isClass(subject)) return undefined
  return spyClass(context, komondorUtil, subject) as any
}

function getStub(context: SpecContext, subject: any, id: string): any {
  if (!isClass(subject)) return undefined
  return stubClass(context, komondorUtil, subject, id)
}

function isClass(subject) {
  return typeof subject === 'function' && Object.keys(subject.prototype).length !== 0;
}
