export declare type PluginModule = {
    activate: (activationContext: PluginActivationContext) => void;
};
export declare type PluginActivationContext = {
    register(plugin: KomondorPlugin<any>): void;
};
export interface KomondorPlugin<T extends object = {}> {
    support: (subject: any) => boolean;
    getSpy: (recorder: any, subject: T) => any;
    getStub: (replayer: any, subject: T) => any;
    serialize?: (subject: T) => string;
}
export declare type PluginInstance = KomondorPlugin & {
    name: string;
};
export declare type PluginIO = {
    getPluginList(): Promise<string[]>;
    loadPlugin(name: string): Promise<PluginModule>;
};
//# sourceMappingURL=types.d.ts.map