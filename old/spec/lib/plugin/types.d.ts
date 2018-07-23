import { RequiredPick } from 'type-plus';
export declare type PluginActivationContext = {
    register(plugin: KomondorPlugin<any>): void;
};
export interface KomondorPlugin<T = any> {
    name?: string;
    support: (subject: any) => boolean;
    getSpy: (context: any, subject: T) => any;
    getStub: (context: any, subject: T) => any;
    serialize?: (subject: T) => string;
}
export declare type PluginModule = {
    activate: (activationContext: PluginActivationContext) => void;
};
export declare type PluginIO = {
    getPluginList(): Promise<string[]>;
    loadPlugin(name: string): Promise<PluginModule>;
};
export declare type PluginInstance = RequiredPick<KomondorPlugin, 'name'>;
//# sourceMappingURL=types.d.ts.map