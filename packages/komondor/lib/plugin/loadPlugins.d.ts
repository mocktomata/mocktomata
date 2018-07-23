import { PluginModule } from './interfaces';
export declare type PluginContext = {
    io: {
        loadPlugin(id: string): Promise<PluginModule>;
    };
};
/**
 * Load plugins to the system.
 */
export declare function loadPlugins({ io }: PluginContext, pluginNames: string[]): Promise<void[]>;
//# sourceMappingURL=loadPlugins.d.ts.map