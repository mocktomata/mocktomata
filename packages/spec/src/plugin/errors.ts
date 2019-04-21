import { SpecError } from '../spec/errors';

export class PluginNotFound extends SpecError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`Could not locate plugin '${pluginName}'`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class DuplicatePlugin extends SpecError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`A plugin with the name '${pluginName}' has already been loaded.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoActivate extends SpecError {
  constructor(public moduleName: string) {
    super(`${moduleName} does not export an 'activate()' function`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class PluginNotConforming extends SpecError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`${pluginName} is not a plugin.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
