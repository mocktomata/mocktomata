"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SpyCallImpl_1 = require("./SpyCallImpl");
class SpyInstanceImpl {
    constructor(context, instanceId) {
        this.context = context;
        this.instanceId = instanceId;
        this.invokeCount = 0;
    }
    newCall(callMeta) {
        return new SpyCallImpl_1.SpyCallImpl(this, ++this.invokeCount, callMeta);
    }
    addAction(action) {
        action.instanceId = this.instanceId;
        return this.context.addAction(action);
    }
    addReturnAction(action) {
        return this.context.addReturnAction(action);
    }
}
exports.SpyInstanceImpl = SpyInstanceImpl;
//# sourceMappingURL=SpyInstanceImpl.js.map