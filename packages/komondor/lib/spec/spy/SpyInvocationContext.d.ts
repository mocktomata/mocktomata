import { Meta, SpecAction } from '../interfaces';
import { SpyCall, SpyContext, SpyInstance } from './interfaces';
import { SpyCallImpl } from './SpyCallImpl';
import { SpyInstanceImpl } from './SpyInstanceImpl';
export declare class SpyInvocationContext implements SpyContext {
    context: {
        actions: SpecAction[];
        instanceIds: Record<string, number>;
    };
    pluginType: string;
    constructor(context: {
        actions: SpecAction[];
        instanceIds: Record<string, number>;
    }, pluginType: string);
    newInstance({ args, meta }: {
        args?: any[];
        meta?: Meta;
    }): SpyInstance;
    addAction(action: Partial<SpecAction>): SpecAction;
    addReturnAction(action: Partial<SpecAction>): any;
    protected getNextId(pluginId: string): number;
}
export declare class SpyReturnContext extends SpyInvocationContext {
    private returnAction;
    constructor(context: {
        actions: SpecAction[];
        instanceIds: Record<string, number>;
    }, pluginType: string, returnAction: Partial<SpecAction>);
    newInstance(options: {
        args?: any[];
        meta?: Meta;
    }): SpyInstance;
}
export declare class SpyCallbackContext extends SpyInvocationContext {
    private spyCall;
    private sourceSite;
    constructor(context: {
        actions: SpecAction[];
        instanceIds: Record<string, number>;
    }, pluginType: string, spyCall: SpyCallImpl, sourceSite: Array<string | number>);
    newInstance({ args, meta }: {
        args?: any[];
        meta?: Meta;
    }): SpyInstance;
}
export declare class SpyCallbackInstanceImpl extends SpyInstanceImpl {
    newCall(callMeta: Meta): SpyCall;
}
export declare class SpyCallbackCallImpl extends SpyCallImpl {
    invoke<T extends any[]>(args: T, meta?: {
        [k: string]: any;
    }): T;
}
//# sourceMappingURL=SpyInvocationContext.d.ts.map