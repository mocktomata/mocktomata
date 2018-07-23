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
var specAction_1 = require("./specAction");
var make_error_1 = require("make-error");
test('serialize error', function () {
    var actual = specAction_1.makeSerializableAction({ payload: new Error('foo') });
    assert_1.default.deepStrictEqual(actual.payload, { message: 'foo', prototype: 'Error' });
});
test('serialize custom error', function () {
    var CustomError = /** @class */ (function (_super) {
        __extends(CustomError, _super);
        // istanbul ignore next
        function CustomError(value) {
            var _newTarget = this.constructor;
            var _this = _super.call(this, "error with " + value) || this;
            _this.value = value;
            Object.setPrototypeOf(_this, _newTarget.prototype);
            return _this;
        }
        return CustomError;
    }(make_error_1.BaseError));
    var actual = specAction_1.makeSerializableAction({ payload: new CustomError('cat') });
    assert_1.default.deepStrictEqual(actual.payload, { message: 'error with cat', value: 'cat', prototype: 'Error' });
});
test('circular reference', function () {
    var payload = [{}];
    payload[0].cir = payload[0];
    var actual = specAction_1.makeSerializableAction({ payload: payload });
    assert_1.default.deepStrictEqual(actual, { payload: [{ cir: '[circular:0]' }] });
});
describe('isMismatchAction()', function () {
    test('type mismatch returns true', function () {
        assert_1.default(specAction_1.isMismatchAction({ plugin: 'x' }, { plugin: 'function' }));
    });
    test('name mismatch returns true', function () {
        assert_1.default(specAction_1.isMismatchAction({ name: 'return' }, { name: 'invoke' }));
    });
    test('payload mismatch returns true', function () {
        assert_1.default(specAction_1.isMismatchAction({ payload: 1 }, { payload: 2 }));
    });
    test('payload matches return false', function () {
        assertron_1.default.false(specAction_1.isMismatchAction({ payload: [1] }, { payload: [1] }));
    });
    test('payload with function matches null', function () {
        assertron_1.default.false(specAction_1.isMismatchAction({ payload: [1, function (x) { return x + 1; }] }, { payload: [1, null] }));
    });
    test('payload is error', function () {
        assertron_1.default.false(specAction_1.isMismatchAction({ payload: new Error('foo') }, { payload: { message: 'foo' } }));
    });
});
//# sourceMappingURL=specAction.spec.js.map