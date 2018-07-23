import { SpecContext } from './context';
import { Meta } from './spec/types';
export declare type CaptureContext = SpecContext;
export declare type SpyContext = {
    newSpy(meta?: Meta): Spy;
};
export declare type Spy = {
    /**
     * Create a new call context for recording the call.
     */
    invoke(args: any[], meta?: Meta): SpyCall;
    instance(args: any[], meta?: Meta): SpyInstance;
    get(meta?: Meta): void;
    set(value: any, meta?: Meta): void;
};
export declare type SpyInstance = {
    invoke(args: any[], meta?: Meta): SpyCall;
};
export declare type SpyCall = {
    /**
     * Record that the call is being invoked
     * @param args the args that the call is invoked with
     */
    invoke<T extends any[]>(args: T, meta?: Meta): T;
    /**
     * Record that the call is returning
     * @param result the return result
     */
    return<T>(result: T, meta?: Meta): T;
    /**
     * Record that the call is throwing
     * @param err the error to be thrown.
     */
    throw<T>(err: T, meta?: Meta): T;
};
import { RequiredPick } from 'type-plus';
export declare type PluginActivationContext = {
    register(plugin: KomondorPlugin<any>): void;
};
export interface KomondorPlugin<T = any> {
    name?: string;
    support: (subject: any) => boolean;
    getSpy: (recorder: SpyContext, subject: T) => any;
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