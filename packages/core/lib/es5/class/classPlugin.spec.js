"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var assertron_1 = __importDefault(require("assertron"));
var child_process_1 = __importDefault(require("child_process"));
var classPlugin_1 = require("./classPlugin");
test('false for simple function', function () {
    assertron_1.default.false(classPlugin_1.classPlugin.support(function (x) { return x; }));
    assertron_1.default.false(classPlugin_1.classPlugin.support(function () { return; }));
});
test('false for object', function () {
    var obj = {
        f: function () { return; }
    };
    assertron_1.default.false(classPlugin_1.classPlugin.support(obj));
});
test('false for method in object', function () {
    var obj = {
        f: function () { return; }
    };
    assertron_1.default.false(classPlugin_1.classPlugin.support(obj.f));
});
test('true for class with at lease one method', function () {
    var F = /** @class */ (function () {
        function F() {
        }
        F.prototype.f = function () { return; };
        return F;
    }());
    assert_1.default(classPlugin_1.classPlugin.support(F));
});
test('child class is true', function () {
    var Parent = /** @class */ (function () {
        function Parent() {
        }
        Parent.prototype.do = function () { return 'do'; };
        return Parent;
    }());
    var Child = /** @class */ (function (_super) {
        __extends(Child, _super);
        function Child() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Child;
    }(Parent));
    assert_1.default(classPlugin_1.classPlugin.support(Child));
});
test('spawn is not a class', function () {
    assertron_1.default.false(classPlugin_1.classPlugin.support(child_process_1.default.spawn));
});
//# sourceMappingURL=classPlugin.spec.js.map