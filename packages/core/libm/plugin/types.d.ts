import { Meta } from '../spec';
export declare type PluginActivationContext = {
    register(plugin: KomondorPlugin<any>): void;
};
export interface KomondorPlugin<S = any> {
    /**
     * Name of the plugin. This is needed only if there are multiple plugins in a package.
     */
    name?: string;
    support: (subject: any) => boolean;
    /**
     * @param context A context that gives the plugin all the tools needed to record what has happend to the subject.
     * @param subject The spying subject
     */
    getSpy(context: SpyContext, subject: S): S;
    getStub(context: StubContext, subject: S): S;
    serialize?: (subject: S) => string;
    deserialize?: (input: string) => S;
}
export declare type SpyContext = {
    newSpyRecorder(spy?: any, meta?: Meta): any;
};
export declare type StubContext = {
    newStubRecorder(stub?: any, meta?: Meta): any;
};
export declare type PluginIO = {
    getPluginList(): Promise<string[]>;
    loadPlugin(name: string): Promise<PluginModule>;
};
export declare type PluginModule = {
    activate: (activationContext: PluginActivationContext) => void;
};
//# sourceMappingURL=types.d.ts.map