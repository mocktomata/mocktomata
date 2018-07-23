import { Meta } from '../interfaces';
import { ReturnAction, SpecAction } from '../specAction';
import { SpyCall, SpyContext, SpyInstance } from './interfaces';
export declare class InvocationContext implements SpyContext {
    context: {
        actions: SpecAction[];
        instanceIds: Record<string, number>;
    };
    pluginType: string;
    constructor(context: {
        actions: SpecAction[];
        instanceIds: Record<string, number>;
    }, pluginType: string);
    construct({ args, meta }: {
        args?: any[];
        meta?: Meta;
    }): SpyInstance;
    addAction(action: Partial<SpecAction>): SpecAction;
    addReturnAction(action: Partial<ReturnAction>): void;
    protected getNextId(pluginId: string): number;
}
export declare class Instance implements SpyInstance {
    invocation: InvocationContext;
    instanceId: number;
    pluginName: string;
    invokeCount: number;
    constructor(invocation: InvocationContext, instanceId: number, pluginName: string, args?: any[] | undefined, meta?: Meta | undefined);
    newCall(callMeta?: Meta): SpyCall;
    addAction(action: Partial<SpecAction>): SpecAction;
    addReturnAction(action: Partial<SpecAction>): void;
}
export declare class Call implements SpyCall {
    instance: Instance;
    invokeId: number;
    callMeta?: {
        [k: string]: any;
    } | undefined;
    constructor(instance: Instance, invokeId: number, callMeta?: {
        [k: string]: any;
    } | undefined);
    invoke<T extends any[]>(args: T, meta?: {
        [k: string]: any;
    }): T;
    return<T>(result: T, meta?: {
        [k: string]: any;
    }): T;
    throw<T>(err: T, meta?: {
        [k: string]: any;
    }): T;
}
//# sourceMappingURL=InvocationContext.d.ts.map