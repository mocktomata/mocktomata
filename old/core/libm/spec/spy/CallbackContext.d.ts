import { SpyCall, SpyInstance } from '.';
import { Meta } from '../interfaces';
import { SpecAction } from '../specAction';
import { Call, Instance, InvocationContext } from './InvocationContext';
export declare class CallbackContext extends InvocationContext {
    private spyCall;
    private sourceSite;
    constructor(context: {
        actions: SpecAction[];
        instanceIds: Record<string, number>;
    }, pluginType: string, spyCall: Call, sourceSite: Array<string | number>);
    construct({ args, meta }: {
        args?: any[];
        meta?: Meta;
    }): SpyInstance;
}
export declare class CallbackInstance extends Instance {
    newCall(callMeta: Meta): SpyCall;
}
export declare class CallbackCall extends Call {
    invoke<T extends any[]>(args: T, meta?: {
        [k: string]: any;
    }): T;
}
//# sourceMappingURL=CallbackContext.d.ts.map