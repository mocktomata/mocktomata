import { SpecError } from '../spec/errors';
export class PluginNotFound extends SpecError {
    // istanbul ignore next
    constructor(pluginName) {
        super(`Could not locate plugin '${pluginName}'`);
        this.pluginName = pluginName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class DuplicatePlugin extends SpecError {
    // istanbul ignore next
    constructor(pluginName) {
        super(`A plugin with the name '${pluginName}' has already been loaded.`);
        this.pluginName = pluginName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class NoActivate extends SpecError {
    constructor(moduleName) {
        super(`${moduleName} does not export an 'activate()' function`);
        this.moduleName = moduleName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class PluginNotConforming extends SpecError {
    // istanbul ignore next
    constructor(pluginName) {
        super(`${pluginName} is not a plugin.`);
        this.pluginName = pluginName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=errors.js.map