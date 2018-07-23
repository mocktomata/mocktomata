import { InvocationContext } from './InvocationContext';
export class ReturnValueContext extends InvocationContext {
    constructor(context, pluginType, returnAction) {
        super(context, pluginType);
        this.returnAction = returnAction;
    }
    construct(options) {
        const instance = super.construct(options);
        this.returnAction.returnInstanceId = instance.instanceId;
        return instance;
    }
}
//# sourceMappingURL=ReturnValueContext.js.map