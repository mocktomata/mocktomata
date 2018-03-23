import { SpecContext, getStub, getSpy, getReturnSpy, getReturnStub, SpecAction, Registrar, ReturnAction, PluginRecord } from 'komondor-plugin'
import path from 'path'


const getSpyFunctions: getSpy<any>[] = []
const getStubFunctions: getStub<any>[] = []
const getReturnSpyFunctions: getReturnSpy[] = []
const getReturnStubFunctions: getReturnStub[] = []

export const util = {
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
  getReturnSpy(context: SpecContext, subject: any, action: ReturnAction) {
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
  }
  // log
}

const komondorRegistrar: Registrar = {
  register(_type: string, pluginRecord: PluginRecord<any>) {
    const { getSpy, getStub, getReturnSpy, getReturnStub } = pluginRecord as any
    if (getSpy)
      getSpyFunctions.unshift(getSpy)

    if (getStub)
      getStubFunctions.unshift(getStub)

    if (getReturnSpy)
      getReturnSpyFunctions.unshift(getReturnSpy)
    if (getReturnStub)
      getReturnStubFunctions.unshift(getReturnStub)
  },
  util
}

export function registerPlugin(plugin) {
  if (plugin.activate) {
    plugin.activate(komondorRegistrar)
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
