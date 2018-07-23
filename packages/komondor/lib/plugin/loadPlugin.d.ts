export declare type PluginContext = {
    io: {
        loadPlugin(id: string): any;
    };
};
export declare function loadPlugins({ io }: PluginContext, pluginIDs: string[]): Promise<void[]>;
//# sourceMappingURL=loadPlugin.d.ts.map