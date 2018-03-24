import { SpecContext, getStub, getSpy, Registrar, ReturnAction, PluginRecord } from 'komondor-plugin'
import path from 'path'


const getSpyFunctions: getSpy<any>[] = []
const getStubFunctions: getStub<any>[] = []

export const util = {
  getSpy(context: SpecContext, subject: any, action: ReturnAction | undefined) {
    for (let i = 0; i < getSpyFunctions.length; i++) {
      const spy = getSpyFunctions[i](context, subject, action)
      if (spy)
        return spy
    }
  },
  getStub(context: SpecContext, subject: any, action: ReturnAction | undefined) {
    for (let i = 0; i < getStubFunctions.length; i++) {
      const stub = getStubFunctions[i](context, subject, action)
      if (stub)
        return stub
    }
  }
}

const komondorRegistrar: Registrar = {
  register(_type: string, pluginRecord: PluginRecord<any>) {
    const { getSpy, getStub } = pluginRecord
    if (getSpy)
      getSpyFunctions.unshift(getSpy)

    if (getStub)
      getStubFunctions.unshift(getStub)
  },
  util: {
    getSpy: util.getSpy,
    getStub: (context, action) => util.getStub(context, undefined, action)
  }
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
