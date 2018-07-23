import { unpartial } from 'unpartial';
import { Call, Instance, InvocationContext } from './InvocationContext';
export class CallbackContext extends InvocationContext {
    constructor(context, pluginType, spyCall, sourceSite) {
        super(context, pluginType);
        this.spyCall = spyCall;
        this.sourceSite = sourceSite;
    }
    construct({ args, meta }) {
        const instanceId = this.getNextId(this.pluginType);
        const action = {
            name: 'construct',
            payload: args,
            meta,
            instanceId,
            sourceType: this.spyCall.instance.invocation.pluginType,
            sourceInstanceId: this.spyCall.instance.instanceId,
            sourceInvokeId: this.spyCall.invokeId,
            sourceSite: this.sourceSite
        };
        this.addAction(action);
        return new CallbackInstance(this, instanceId, this.pluginType);
    }
}
export class CallbackInstance extends Instance {
    newCall(callMeta) {
        return new CallbackCall(this, ++this.invokeCount, callMeta);
    }
}
export class CallbackCall extends Call {
    invoke(args, meta) {
        this.instance.addAction({
            name: 'invoke',
            payload: args,
            meta: this.callMeta ? unpartial(this.callMeta, meta) : meta,
            invokeId: this.invokeId
        });
        return args;
    }
}
//# sourceMappingURL=CallbackContext.js.map