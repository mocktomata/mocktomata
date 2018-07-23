import { InvocationContext } from './InvocationContext';
import { SpecAction, ReturnAction } from '../specAction';
import { Meta } from '../interfaces';
export declare class ReturnValueContext extends InvocationContext {
    private returnAction;
    constructor(context: {
        actions: SpecAction[];
        instanceIds: Record<string, number>;
    }, pluginType: string, returnAction: Partial<ReturnAction>);
    construct(options: {
        args?: any[];
        meta?: Meta;
    }): import("./interfaces").SpyInstance;
}
//# sourceMappingURL=ReturnValueContext.d.ts.map