import { KomondorError } from '../errors';

export class PluginNotFound extends KomondorError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`Could not locate plugin '${pluginName}'`)
  }
}

export class DuplicatePlugin extends KomondorError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`A plugin with the name '${pluginName}' has already been loaded.`)
  }
}

export class NoActivate extends KomondorError {
  // istanbul ignore next
  constructor(public moduleName: string) {
    super(`${moduleName} does not export an 'activate()' function`)
  }
}

export class PluginNotConforming extends KomondorError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`${pluginName} is not a plugin.`)
  }
}
