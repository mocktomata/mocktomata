import { Registrar, Plugin } from 'komondor-plugin'
import path from 'path'

import { DuplicatePlugin, InvalidPlugin } from './errors'

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
  plugin.activate(komondorRegistrar)
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

export function loadPlugin(cwd, p?) {
  // istanbul ignore next
  const pluginPath = p ? path.resolve(cwd, 'node_modules', p) : cwd
  const m = require(pluginPath)
  if (typeof m.activate !== 'function') {
    throw new InvalidPlugin(p)
  }
  registerPlugin(m)
}
