import { Registrar, Plugin } from 'komondor-plugin'
import path from 'path'

import { DuplicatePlugin } from './errors'

export const plugins: Array<Plugin<any>> = []

const komondorRegistrar: Registrar = {
  register(type: string, support, getSpy, getStub, serialize) {
    if (plugins.some(p => p.type === type)) {
      throw new DuplicatePlugin(type)
    }

    plugins.unshift({ type, support, getSpy, getStub, serialize })
  }
}

export function registerPlugin(plugin: { activate: (registrar: Registrar) => void }) {
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

export function loadConfig(cwd) {
  const pjson = require(path.resolve(cwd, 'package.json'))
  return pjson.komondor
}

// istanbul ignore next
export function loadPlugin(cwd, p) {
  // '.' is used by plugin package to test itself.
  const pluginPath = p === '.' ? cwd : path.resolve(cwd, 'node_modules', p)
  const m = require(pluginPath)
  registerPlugin(m)
}
