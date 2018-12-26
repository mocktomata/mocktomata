import { BaseError } from 'make-error';

export class PluginAlreadyLoaded extends BaseError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`Plugin ${pluginName} is already loaded.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
