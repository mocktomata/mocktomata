import { Registrar, getSpy, getStub } from 'komondor-plugin'
import path from 'path'


export const plugins: Array<{
  type: string,
  getSpy: getSpy<any>,
  getStub: getStub<any>,
  support: (subject) => boolean
}> = []

const komondorRegistrar: Registrar = {
  register(type: string, support, getSpy, getStub) {
    plugins.unshift({ type, support, getSpy, getStub })
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
