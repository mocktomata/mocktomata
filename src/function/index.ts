import { SpecContext, SpecPluginUtil, KomondorRegistrar } from '../interfaces'

import { spyFunction } from './getSpyFunction'
import { stubFunction } from './getStubFunction'

let komondorUtil: SpecPluginUtil

export function activate(registrar: KomondorRegistrar, util: SpecPluginUtil) {
  komondorUtil = util
  registrar.registerGetSpy(getSpy)
  registrar.registerGetStub(getStub)
}

function getSpy(context: SpecContext, subject: any) {
  return spyFunction(context, komondorUtil, subject)
}

function getStub(context: SpecContext, subject: any, id: string) {
  return stubFunction(context, komondorUtil, subject, id)
}
