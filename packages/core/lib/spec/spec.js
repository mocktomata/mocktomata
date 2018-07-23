"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createSpec_1 = require("./createSpec");
exports.spec = Object.assign(createSpec_1.createSpec('auto'), {
    live: createSpec_1.createSpec('live'),
    save: createSpec_1.createSpec('save'),
    simulate: createSpec_1.createSpec('simulate')
});
//# sourceMappingURL=spec.js.map