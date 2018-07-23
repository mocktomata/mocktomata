"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isClass_1 = require("./isClass");
var spyClass_1 = require("./spyClass");
var stubClass_1 = require("./stubClass");
exports.classPlugin = {
    name: 'class',
    support: isClass_1.isClass,
    getSpy: spyClass_1.spyClass,
    getStub: stubClass_1.stubClass
};
//# sourceMappingURL=classPlugin.js.map