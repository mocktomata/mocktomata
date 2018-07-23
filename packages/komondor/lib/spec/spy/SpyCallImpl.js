"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unpartial_1 = require("unpartial");
const plugin_1 = require("../../plugin");
const artifactify_1 = require("../artifactify");
const constants_1 = require("../constants");
const SpyInvocationContext_1 = require("./SpyInvocationContext");
class SpyCallImpl {
    constructor(instance, invokeId, callMeta) {
        this.instance = instance;
        this.invokeId = invokeId;
        this.callMeta = callMeta;
    }
    invoke(args, meta) {
        this.instance.addAction({
            name: 'invoke',
            payload: args,
            meta: this.callMeta ? unpartial_1.unpartial(this.callMeta, meta) : meta,
            invokeId: this.invokeId
        });
        return args.map((arg, i) => {
            if (arg === undefined || arg === null)
                return arg;
            if (arg[constants_1.artifactKey])
                return artifactify_1.unartifactify(arg);
            if (Array.isArray(arg)) {
                // assuming there will be no callbacks in array parameters
                return arg;
            }
            const plugin = plugin_1.findSupportingPlugin(arg);
            if (plugin) {
                const context = new SpyInvocationContext_1.SpyCallbackContext(this.instance.context.context, plugin.type, this, [i]);
                return plugin.getSpy(context, arg);
            }
            if (typeof arg === 'object') {
                const result = {};
                Object.keys(arg).forEach(key => {
                    const prop = arg[key];
                    const plugin = plugin_1.findSupportingPlugin(prop);
                    if (plugin) {
                        const context = new SpyInvocationContext_1.SpyCallbackContext(this.instance.context.context, plugin.type, this, [i, key]);
                        result[key] = plugin.getSpy(context, prop);
                    }
                    else {
                        result[key] = prop;
                    }
                });
                return result;
            }
            return arg;
        });
    }
    return(result, meta) {
        const action = this.instance.addAction({
            name: 'return',
            payload: result,
            meta: this.callMeta ? unpartial_1.unpartial(this.callMeta, meta) : meta,
            invokeId: this.invokeId
        });
        return this.instance.addReturnAction(action) || result;
    }
    throw(err, meta) {
        this.instance.addAction({
            name: 'throw',
            payload: err,
            meta: this.callMeta ? unpartial_1.unpartial(this.callMeta, meta) : meta,
            invokeId: this.invokeId
        });
        return err;
    }
}
exports.SpyCallImpl = SpyCallImpl;
//# sourceMappingURL=SpyCallImpl.js.map