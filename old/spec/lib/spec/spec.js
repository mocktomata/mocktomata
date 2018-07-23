"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createSpec_1 = require("./createSpec");
exports.spec = Object.assign(createSpec_1.createSpec('live'), {
    live: createSpec_1.createSpec('live'),
    save: createSpec_1.createSpec('save'),
    replay: createSpec_1.createSpec('replay')
});
//# sourceMappingURL=spec.js.map