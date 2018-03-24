import { SpecContext, Registrar, ReturnAction, getSpy, getStub } from 'komondor-plugin'
import path from 'path'


const plugins: Array<{
  type: string,
  getSpy: getSpy<any>,
  getStub: getStub<any>,
  support: (subject) => boolean
}> = []

export const util = {
  getSpy(context: SpecContext, subject: any, action: ReturnAction | undefined) {
    const plugin = plugins.find(p => p.support(subject))
    if (plugin)
      return plugin.getSpy(context, subject, action)
  },
  getStub(context: SpecContext, subject: any, action: ReturnAction | undefined) {
    const plugin = plugins.find(p => (action && action.meta.returnType === p.type) || p.support(subject))
    if (plugin)
      return plugin.getStub(context, subject, action)
  }
}

const komondorRegistrar: Registrar = {
  register(type: string, support, getSpy, getStub) {
    plugins.unshift({ type, support, getSpy, getStub })
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
