import { SpecError } from '../spec/errors';
export declare class PluginNotFound extends SpecError {
    pluginName: string;
    constructor(pluginName: string);
}
export declare class DuplicatePlugin extends SpecError {
    pluginName: string;
    constructor(pluginName: string);
}
export declare class NoActivate extends SpecError {
    moduleName: string;
    constructor(moduleName: string);
}
export declare class PluginNotConforming extends SpecError {
    pluginName: string;
    constructor(pluginName: string);
}
//# sourceMappingURL=errors.d.ts.map