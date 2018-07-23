"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plugin_1 = require("@komondor-lab/plugin");
var unpartial_1 = require("unpartial");
var artifactify_1 = require("../artifactify");
var constants_1 = require("../constants");
// import { ReturnValueContext } from './ReturnValueContext';
// naming: Invocation vs Expression vs Statement
// It's where the code is being directly referenced (for value type) or used (for function and classes)
var InvocationContext = /** @class */ (function () {
    function InvocationContext(context, pluginType) {
        this.context = context;
        this.pluginType = pluginType;
        context.instanceIds[pluginType] = context.instanceIds[pluginType] || 0;
    }
    InvocationContext.prototype.construct = function (_a) {
        var args = _a.args, meta = _a.meta;
        var instanceId = ++this.context.instanceIds[this.pluginType];
        return new Instance(this, instanceId, this.pluginType, args, meta);
    };
    InvocationContext.prototype.addAction = function (action) {
        var a = unpartial_1.unpartial({ plugin: this.pluginType }, action);
        this.context.actions.push(a);
        return a;
    };
    InvocationContext.prototype.addReturnAction = function (action) {
        var plugin = plugin_1.findPlugin(action.payload);
        if (plugin) {
            // const childContext = new ReturnValueContext(this.context, plugin.name, action)
            // action.returnType = plugin.name
            // return getSpy(childContext, plugin, action.payload)
        }
    };
    InvocationContext.prototype.getNextId = function (pluginId) {
        return ++this.context.instanceIds[pluginId];
    };
    return InvocationContext;
}());
exports.InvocationContext = InvocationContext;
var Instance = /** @class */ (function () {
    function Instance(invocation, instanceId, pluginName, args, meta) {
        this.invocation = invocation;
        this.instanceId = instanceId;
        this.pluginName = pluginName;
        this.invokeCount = 0;
        invocation.context.actions.push({
            name: 'construct',
            plugin: pluginName,
            payload: args,
            meta: meta,
            instanceId: instanceId
        });
    }
    Instance.prototype.newCall = function (callMeta) {
        return new Call(this, ++this.invokeCount, callMeta);
    };
    Instance.prototype.addAction = function (action) {
        var a = unpartial_1.unpartial({ instanceId: this.instanceId, pluginType: this.invocation.pluginType }, action);
        this.invocation.context.actions.push(a);
        return this.invocation.addAction(action);
    };
    Instance.prototype.addReturnAction = function (action) {
        return this.invocation.addReturnAction(action);
    };
    return Instance;
}());
exports.Instance = Instance;
var Call = /** @class */ (function () {
    function Call(instance, invokeId, callMeta) {
        this.instance = instance;
        this.invokeId = invokeId;
        this.callMeta = callMeta;
    }
    Call.prototype.invoke = function (args, meta) {
        this.instance.addAction({
            name: 'invoke',
            payload: args,
            meta: this.callMeta ? unpartial_1.unpartial(this.callMeta, meta) : meta,
            invokeId: this.invokeId
        });
        return args.map(function (arg, i) {
            if (arg === undefined || arg === null)
                return arg;
            if (arg[constants_1.artifactKey])
                return artifactify_1.unartifactify(arg);
            if (Array.isArray(arg)) {
                // assuming there will be no callbacks in array parameters
                return arg;
            }
            var plugin = plugin_1.findPlugin(arg);
            if (plugin) {
                // const context = new CallbackContext(this.instance.invocation.context, plugin.name, this, [i])
                // return plugin.getSpy(context, arg)
            }
            if (typeof arg === 'object') {
                var result_1 = {};
                Object.keys(arg).forEach(function (key) {
                    var prop = arg[key];
                    var plugin = plugin_1.findPlugin(prop);
                    if (plugin) {
                        // const context = new CallbackContext(this.instance.invocation.context, plugin.name, this, [i, key])
                        // result[key] = plugin.getSpy(context, prop)
                    }
                    else {
                        result_1[key] = prop;
                    }
                });
                return result_1;
            }
            return arg;
        });
    };
    Call.prototype.return = function (result, meta) {
        return {};
        // const action = this.instance.addAction({
        //   name: 'return',
        //   payload: result,
        //   meta: this.callMeta ? unpartial(this.callMeta, meta) : meta,
        //   invokeId: this.invokeId
        // })
        // return this.instance.addReturnAction(action) || result
    };
    Call.prototype.throw = function (err, meta) {
        this.instance.addAction({
            name: 'throw',
            payload: err,
            meta: this.callMeta ? unpartial_1.unpartial(this.callMeta, meta) : meta,
            invokeId: this.invokeId
        });
        return err;
    };
    return Call;
}());
exports.Call = Call;
//# sourceMappingURL=InvocationContext.js.map