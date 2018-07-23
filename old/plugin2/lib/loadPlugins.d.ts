import { PluginIO } from './types';
export declare type LoadPluginContext = {
    io: PluginIO;
};
/**
 * Load plugins to the system.
 */
export declare function loadPlugins({ io }: LoadPluginContext): Promise<void[]>;
//# sourceMappingURL=loadPlugins.d.ts.map