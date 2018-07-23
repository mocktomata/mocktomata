import { findPlugin } from '@komondor-lab/plugin';
import { unpartial } from 'unpartial';
import { unartifactify } from '../artifactify';
import { artifactKey } from '../constants';
// import { ReturnValueContext } from './ReturnValueContext';
// naming: Invocation vs Expression vs Statement
// It's where the code is being directly referenced (for value type) or used (for function and classes)
export class InvocationContext {
    constructor(context, pluginType) {
        this.context = context;
        this.pluginType = pluginType;
        context.instanceIds[pluginType] = context.instanceIds[pluginType] || 0;
    }
    construct({ args, meta }) {
        const instanceId = ++this.context.instanceIds[this.pluginType];
        return new Instance(this, instanceId, this.pluginType, args, meta);
    }
    addAction(action) {
        const a = unpartial({ plugin: this.pluginType }, action);
        this.context.actions.push(a);
        return a;
    }
    addReturnAction(action) {
        const plugin = findPlugin(action.payload);
        if (plugin) {
            // const childContext = new ReturnValueContext(this.context, plugin.name, action)
            // action.returnType = plugin.name
            // return getSpy(childContext, plugin, action.payload)
        }
    }
    getNextId(pluginId) {
        return ++this.context.instanceIds[pluginId];
    }
}
export class Instance {
    constructor(invocation, instanceId, pluginName, args, meta) {
        this.invocation = invocation;
        this.instanceId = instanceId;
        this.pluginName = pluginName;
        this.invokeCount = 0;
        invocation.context.actions.push({
            name: 'construct',
            plugin: pluginName,
            payload: args,
            meta,
            instanceId
        });
    }
    newCall(callMeta) {
        return new Call(this, ++this.invokeCount, callMeta);
    }
    addAction(action) {
        const a = unpartial({ instanceId: this.instanceId, pluginType: this.invocation.pluginType }, action);
        this.invocation.context.actions.push(a);
        return this.invocation.addAction(action);
    }
    addReturnAction(action) {
        return this.invocation.addReturnAction(action);
    }
}
export class Call {
    constructor(instance, invokeId, callMeta) {
        this.instance = instance;
        this.invokeId = invokeId;
        this.callMeta = callMeta;
    }
    invoke(args, meta) {
        this.instance.addAction({
            name: 'invoke',
            payload: args,
            meta: this.callMeta ? unpartial(this.callMeta, meta) : meta,
            invokeId: this.invokeId
        });
        return args.map((arg, i) => {
            if (arg === undefined || arg === null)
                return arg;
            if (arg[artifactKey])
                return unartifactify(arg);
            if (Array.isArray(arg)) {
                // assuming there will be no callbacks in array parameters
                return arg;
            }
            const plugin = findPlugin(arg);
            if (plugin) {
                // const context = new CallbackContext(this.instance.invocation.context, plugin.name, this, [i])
                // return plugin.getSpy(context, arg)
            }
            if (typeof arg === 'object') {
                const result = {};
                Object.keys(arg).forEach(key => {
                    const prop = arg[key];
                    const plugin = findPlugin(prop);
                    if (plugin) {
                        // const context = new CallbackContext(this.instance.invocation.context, plugin.name, this, [i, key])
                        // result[key] = plugin.getSpy(context, prop)
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
        return {};
        // const action = this.instance.addAction({
        //   name: 'return',
        //   payload: result,
        //   meta: this.callMeta ? unpartial(this.callMeta, meta) : meta,
        //   invokeId: this.invokeId
        // })
        // return this.instance.addReturnAction(action) || result
    }
    throw(err, meta) {
        this.instance.addAction({
            name: 'throw',
            payload: err,
            meta: this.callMeta ? unpartial(this.callMeta, meta) : meta,
            invokeId: this.invokeId
        });
        return err;
    }
}
//# sourceMappingURL=InvocationContext.js.map