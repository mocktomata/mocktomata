import path from 'path'

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

// istanbul ignore next
export function loadPlugins() {
  const cwd = process.cwd()
  const config = loadConfig(cwd)
  if (config && config.plugins) {
    config.plugins.forEach(p => {
      loadPlugin(cwd, p)
    })
  }
}

// istanbul ignore next
export function loadConfig(cwd) {
  const pjson = require(path.resolve(cwd, 'package.json'))
  return pjson.komondor
}

// istanbul ignore next
export function loadPlugin(cwd, p) {
  const pluginPath = path.resolve(cwd, 'node_modules', p)
  const m = require(pluginPath)
  registerPlugin(m)
}
