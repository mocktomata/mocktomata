import { KomondorError } from '../common';
export class PluginNotFound extends KomondorError {
    // istanbul ignore next
    constructor(pluginName) {
        super(`Could not locate plugin '${pluginName}'`);
        this.pluginName = pluginName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class DuplicatePlugin extends KomondorError {
    // istanbul ignore next
    constructor(pluginName) {
        super(`A plugin with the name '${pluginName}' has already been loaded.`);
        this.pluginName = pluginName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class NoActivate extends KomondorError {
    // istanbul ignore next
    constructor(moduleName) {
        super(`${moduleName} does not export an 'activate()' function`);
        this.moduleName = moduleName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class PluginNotConforming extends KomondorError {
    // istanbul ignore next
    constructor(pluginName) {
        super(`${pluginName} is not a plugin.`);
        this.pluginName = pluginName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=errors.js.map