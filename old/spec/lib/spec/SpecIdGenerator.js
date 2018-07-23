"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var global_store_1 = __importDefault(require("global-store"));
var store = global_store_1.default('@komondor-lab/spec/instanceId', { instanceIds: {} });
var InstanceIdGenerator = /** @class */ (function () {
    function InstanceIdGenerator() {
    }
    InstanceIdGenerator.prototype.newId = function (pluginType) {
        var count = store.get().instanceIds[pluginType] || 0;
        return store.get().instanceIds[pluginType] = count + 1;
    };
    return InstanceIdGenerator;
}());
exports.InstanceIdGenerator = InstanceIdGenerator;
//# sourceMappingURL=SpecIdGenerator.js.map