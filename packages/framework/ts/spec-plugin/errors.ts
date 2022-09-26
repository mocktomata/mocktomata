import { MocktomataError } from '../errors.js'

export class PluginNotFound extends MocktomataError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`Could not locate plugin '${pluginName}'`)
  }
}

export class DuplicatePlugin extends MocktomataError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`A plugin with the name '${pluginName}' has already been loaded.`)
  }
}

export class PluginModuleNotConforming extends MocktomataError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`${pluginName} is not a valid plugin module.`)
  }
}

export class PluginNotConforming extends MocktomataError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`${pluginName} is not a plugin.`)
  }
}

