
import {
  // @ts-ignore
  Spy,
  SpecContext, getStub, SpecPluginUtil, getSpy, getReturnSpy, getReturnStub, ReturnActionBase, SpecAction, KomondorRegistrar
} from './interfaces'
import { log } from './log'

const getSpyFunctions: getSpy[] = []
const getStubFunctions: getStub[] = []
const getReturnSpyFunctions: getReturnSpy[] = []
const getReturnStubFunctions: getReturnStub[] = []

export const komondorUtil: SpecPluginUtil = {
  getSpy(context: SpecContext, subject: any) {
    for (let i = 0; i < getSpyFunctions.length; i++) {
      const spy = getSpyFunctions[i](context, subject)
      if (spy)
        return spy
    }
  },
  getStub(context: SpecContext, subject: any, id: string) {
    for (let i = 0; i < getStubFunctions.length; i++) {
      const stub = getStubFunctions[i](context, subject, id)
      if (stub)
        return stub
    }
  },
  getReturnSpy(context: SpecContext, subject: any, action: ReturnActionBase) {
    for (let i = 0; i < getReturnSpyFunctions.length; i++) {
      const spy = getReturnSpyFunctions[i](context, subject, action)
      if (spy)
        return spy
    }
  },
  getReturnStub(context: SpecContext, action: SpecAction) {
    for (let i = 0; i < getReturnStubFunctions.length; i++) {
      const stub = getReturnStubFunctions[i](context, action)
      if (stub)
        return stub
    }
  },
  log
}

const komondorRegistrar: KomondorRegistrar = {
  registerGetSpy(getSpy) {
    getSpyFunctions.unshift(getSpy)
  },
  registerGetStub(getStub) {
    getStubFunctions.unshift(getStub)
  },
  registerGetReturnSpy(getReturnSpy) {
    getReturnSpyFunctions.unshift(getReturnSpy)
  },
  registerGetReturnStub(getReturnStub) {
    getReturnStubFunctions.unshift(getReturnStub)
  }
}

export function registerPlugin(plugin) {
  if (plugin.activate) {
    plugin.activate(komondorRegistrar, komondorUtil)
  }
}
