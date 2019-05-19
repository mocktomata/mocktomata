import { KomondorError } from '../common';

export class PluginNotFound extends KomondorError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`Could not locate plugin '${pluginName}'`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class DuplicatePlugin extends KomondorError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`A plugin with the name '${pluginName}' has already been loaded.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoActivate extends KomondorError {
  // istanbul ignore next
  constructor(public moduleName: string) {
    super(`${moduleName} does not export an 'activate()' function`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class PluginNotConforming extends KomondorError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`${pluginName} is not a plugin.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
