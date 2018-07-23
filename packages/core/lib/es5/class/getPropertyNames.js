"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
function getPropertyNames(target, names) {
    if (names === void 0) { names = []; }
    var proto = Object.getPrototypeOf(target);
    if (proto.prototype === undefined)
        return names;
    return getPropertyNames(proto, ramda_1.uniq(names.concat(Object.getOwnPropertyNames(proto.prototype).filter(function (x) { return x !== 'constructor'; }))));
}
exports.getPropertyNames = getPropertyNames;
//# sourceMappingURL=getPropertyNames.js.map