import { BaseError } from 'make-error';

export class DuplicatePlugin extends BaseError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`Plugin ${pluginName} is already loaded.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class InvalidPlugin extends BaseError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`${pluginName} is not a plugin.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
