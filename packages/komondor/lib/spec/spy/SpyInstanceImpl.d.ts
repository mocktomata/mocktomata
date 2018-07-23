import { Meta, SpecAction } from '../interfaces';
import { SpyCall, SpyInstance } from './interfaces';
import { SpyInvocationContext } from './SpyInvocationContext';
export declare class SpyInstanceImpl implements SpyInstance {
    context: SpyInvocationContext;
    instanceId: number;
    invokeCount: number;
    constructor(context: SpyInvocationContext, instanceId: number);
    newCall(callMeta?: Meta): SpyCall;
    addAction(action: Partial<SpecAction>): SpecAction;
    addReturnAction(action: Partial<SpecAction>): any;
}
//# sourceMappingURL=SpyInstanceImpl.d.ts.map