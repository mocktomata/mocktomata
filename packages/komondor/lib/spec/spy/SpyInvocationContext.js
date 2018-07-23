"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unpartial_1 = require("unpartial");
const plugin_1 = require("../../plugin");
const getSpy_1 = require("./getSpy");
const SpyCallImpl_1 = require("./SpyCallImpl");
const SpyInstanceImpl_1 = require("./SpyInstanceImpl");
class SpyInvocationContext {
    constructor(context, pluginType) {
        this.context = context;
        this.pluginType = pluginType;
        context.instanceIds[pluginType] = context.instanceIds[pluginType] || 0;
    }
    newInstance({ args, meta }) {
        const instanceId = this.getNextId(this.pluginType);
        const action = {
            name: 'construct',
            payload: args,
            meta,
            instanceId
        };
        this.addAction(action);
        return new SpyInstanceImpl_1.SpyInstanceImpl(this, instanceId);
    }
    addAction(action) {
        const a = unpartial_1.unpartial({ type: this.pluginType }, action);
        this.context.actions.push(a);
        return a;
    }
    addReturnAction(action) {
        const plugin = plugin_1.findSupportingPlugin(action.payload);
        if (plugin) {
            const childContext = new SpyReturnContext(this.context, plugin.type, action);
            action.returnType = plugin.type;
            return getSpy_1.getSpy(childContext, plugin, action.payload);
        }
    }
    getNextId(pluginId) {
        return ++this.context.instanceIds[pluginId];
    }
}
exports.SpyInvocationContext = SpyInvocationContext;
class SpyReturnContext extends SpyInvocationContext {
    constructor(context, pluginType, returnAction) {
        super(context, pluginType);
        this.returnAction = returnAction;
    }
    newInstance(options) {
        const instance = super.newInstance(options);
        this.returnAction.returnInstanceId = instance.instanceId;
        return instance;
    }
}
exports.SpyReturnContext = SpyReturnContext;
class SpyCallbackContext extends SpyInvocationContext {
    constructor(context, pluginType, spyCall, sourceSite) {
        super(context, pluginType);
        this.spyCall = spyCall;
        this.sourceSite = sourceSite;
    }
    newInstance({ args, meta }) {
        const instanceId = this.getNextId(this.pluginType);
        const action = {
            name: 'construct',
            payload: args,
            meta,
            instanceId,
            sourceType: this.spyCall.instance.context.pluginType,
            sourceInstanceId: this.spyCall.instance.instanceId,
            sourceInvokeId: this.spyCall.invokeId,
            sourceSite: this.sourceSite
        };
        this.addAction(action);
        return new SpyCallbackInstanceImpl(this, instanceId);
    }
}
exports.SpyCallbackContext = SpyCallbackContext;
class SpyCallbackInstanceImpl extends SpyInstanceImpl_1.SpyInstanceImpl {
    newCall(callMeta) {
        return new SpyCallbackCallImpl(this, ++this.invokeCount, callMeta);
    }
}
exports.SpyCallbackInstanceImpl = SpyCallbackInstanceImpl;
class SpyCallbackCallImpl extends SpyCallImpl_1.SpyCallImpl {
    invoke(args, meta) {
        this.instance.addAction({
            name: 'invoke',
            payload: args,
            meta: this.callMeta ? unpartial_1.unpartial(this.callMeta, meta) : meta,
            invokeId: this.invokeId
        });
        return args;
    }
}
exports.SpyCallbackCallImpl = SpyCallbackCallImpl;
//# sourceMappingURL=SpyInvocationContext.js.map