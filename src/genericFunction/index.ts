import { spyFunction } from './getSpyFunction'
import { stubFunction } from './getStubFunction'
import { SpecContext, SpecPluginUtil } from '../index'

let komondorUtil: SpecPluginUtil

export function activate(util: SpecPluginUtil) {
  komondorUtil = util
}

export function getSpy(context: SpecContext, subject: any) {
  return spyFunction(context, komondorUtil, subject)
}

export function getStub(context: SpecContext, subject: any, id: string) {
  return stubFunction(context, komondorUtil, subject, id)
}
