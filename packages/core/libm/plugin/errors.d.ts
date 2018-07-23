import { KomondorError } from '../common';
export declare class PluginNotFound extends KomondorError {
    pluginName: string;
    constructor(pluginName: string);
}
export declare class DuplicatePlugin extends KomondorError {
    pluginName: string;
    constructor(pluginName: string);
}
export declare class NoActivate extends KomondorError {
    moduleName: string;
    constructor(moduleName: string);
}
export declare class PluginNotConforming extends KomondorError {
    pluginName: string;
    constructor(pluginName: string);
}
//# sourceMappingURL=errors.d.ts.map