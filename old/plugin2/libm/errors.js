import { BaseError } from 'make-error';
export class PluginNotFound extends BaseError {
    // istanbul ignore next
    constructor(pluginName) {
        super(`Could not locate plugin '${pluginName}'`);
        this.pluginName = pluginName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class PluginAlreadyLoaded extends BaseError {
    // istanbul ignore next
    constructor(pluginName) {
        super(`A plugin with the name '${pluginName}' has already been loaded.`);
        this.pluginName = pluginName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class PluginNotConforming extends BaseError {
    // istanbul ignore next
    constructor(pluginName) {
        super(`${pluginName} is not a plugin.`);
        this.pluginName = pluginName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=errors.js.map