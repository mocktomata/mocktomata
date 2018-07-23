"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const _1 = require(".");
const expectedAction = { type: 'function', name: 'invoke', payload: [0, 'a'] };
const actualCallbackAction = { type: 'komondor', name: 'callback', payload: { a: 1 }, meta: { id: 3 } };
test('SimulationMismatch error', () => {
    const err = new _1.SimulationMismatch('some id', expectedAction, actualCallbackAction);
    assert_1.default.strictEqual(err.specId, 'some id');
    assert_1.default.strictEqual(err.expected, expectedAction);
    assert_1.default.strictEqual(err.actual, actualCallbackAction);
    assert_1.default.strictEqual(err.message, `Recorded data for 'some id' doesn't match with simulation. Expecting { type: 'function', name: 'invoke', payload: [0, 'a'] } but received { type: 'komondor', name: 'callback', payload: { a: 1 }, meta: { id: 3 } }`);
});
test('SimulationMismatch error, received action optional', () => {
    const err = new _1.SimulationMismatch('some id', expectedAction);
    assert_1.default.strictEqual(err.specId, 'some id');
    assert_1.default.strictEqual(err.expected, expectedAction);
    assert_1.default.strictEqual(err.message, `Recorded data for 'some id' doesn't match with simulation. Expecting { type: 'function', name: 'invoke', payload: [0, 'a'] } but received undefined`);
});
//# sourceMappingURL=errors.spec.js.map