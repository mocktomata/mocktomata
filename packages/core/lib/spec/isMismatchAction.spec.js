"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var assertron_1 = __importDefault(require("assertron"));
var isMismatchAction_1 = require("./isMismatchAction");
describe('isMismatchAction()', function () {
    test('ref mismatch returns true', function () {
        assert_1.default(isMismatchAction_1.isMismatchAction(specAction({ ref: '1' }), specAction({ ref: '2' })));
    });
    test('type mismatch returns true', function () {
        assert_1.default(isMismatchAction_1.isMismatchAction(specAction({ type: 'construct' }), specAction({ type: 'invoke' })));
    });
    test('payload mismatch returns true', function () {
        assert_1.default(isMismatchAction_1.isMismatchAction(specAction({ payload: 1 }), specAction({ payload: 2 })));
    });
    test('payload matches return false', function () {
        assertron_1.default.false(isMismatchAction_1.isMismatchAction(specAction({ payload: [1] }), specAction({ payload: [1] })));
    });
    test('payload with function matches null', function () {
        assertron_1.default.false(isMismatchAction_1.isMismatchAction(specAction({ payload: [1, function (x) { return x + 1; }] }), specAction({ payload: [1, null] })));
    });
    test('payload is error', function () {
        assertron_1.default.false(isMismatchAction_1.isMismatchAction(specAction({ payload: new Error('foo') }), specAction({ payload: { message: 'foo' } })));
    });
});
function specAction(action) {
    return action;
}
exports.specAction = specAction;
//# sourceMappingURL=isMismatchAction.spec.js.map