import { BaseError } from 'make-error';

export class PluginNotFound extends BaseError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`Could not locate plugin '${pluginName}'`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class PluginAlreadyLoaded extends BaseError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`A plugin with the name '${pluginName}' has already been loaded.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class PluginNotConforming extends BaseError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`${pluginName} is not a plugin.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
