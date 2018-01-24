import { SpecContext, SpecPluginUtil } from '../index'

import { spyClass } from './spyClass'
import { stubClass } from './stubClass'

let komondorUtil: SpecPluginUtil

export function activate(util: SpecPluginUtil) {
  komondorUtil = util
}

export function getSpy<T = any>(context: SpecContext, subject: T) {
  if (!isClass(subject)) return undefined
  return spyClass(context, komondorUtil, subject) as any
}

function isClass(subject) {
  return typeof subject === 'function' && Object.keys(subject.prototype).length !== 0;
}

export function getStub(context: SpecContext, subject: any, id: string): any {
  if (!isClass(subject)) return undefined
  return stubClass(context, komondorUtil, subject, id)
}
