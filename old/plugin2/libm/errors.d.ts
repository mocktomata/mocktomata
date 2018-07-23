import { BaseError } from 'make-error';
export declare class PluginNotFound extends BaseError {
    pluginName: string;
    constructor(pluginName: string);
}
export declare class PluginAlreadyLoaded extends BaseError {
    pluginName: string;
    constructor(pluginName: string);
}
export declare class PluginNotConforming extends BaseError {
    pluginName: string;
    constructor(pluginName: string);
}
//# sourceMappingURL=errors.d.ts.map