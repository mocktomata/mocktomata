"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assertron_1 = __importDefault(require("assertron"));
const _1 = require(".");
describe('createExpectation', () => {
    test('create with meta', () => {
        const s = _1.createExpectation('node-fetch', 'invoke', { b: 1 });
        const expectation = s('payload', { a: 1 });
        assertron_1.default.satisfy({ type: 'node-fetch', name: 'invoke', payload: 'payload', meta: { a: 1, b: 1 } }, expectation);
    });
    test('can use expectation with meta', () => {
        const s = _1.createExpectation('node-fetch', 'invoke');
        const expectation = s('payload', { a: 1 });
        assertron_1.default.satisfy({ type: 'node-fetch', name: 'invoke', payload: 'payload', meta: { a: 1 } }, expectation);
    });
    test('can use expectation without meta', () => {
        const s = _1.createExpectation('node-fetch', 'invoke');
        const expectation = s('payload');
        assertron_1.default.satisfy({ type: 'node-fetch', name: 'invoke', payload: 'payload' }, expectation);
    });
});
describe('createScopedCreateExpectation', () => {
    test('create with meta', () => {
        const createSatisfier = _1.createScopedCreateExpectation('x');
        const s = createSatisfier('node-fetch', 'invoke', { b: 1 });
        const expectation = s('payload', { a: 1 });
        assertron_1.default.satisfy({ type: 'x/node-fetch', name: 'invoke', payload: 'payload', meta: { a: 1, b: 1 } }, expectation);
    });
    test('create with meta', () => {
        const createSatisfier = _1.createScopedCreateExpectation('x');
        const s = createSatisfier('node-fetch', 'invoke');
        const expectation = s('payload', { a: 1 });
        assertron_1.default.satisfy({ type: 'x/node-fetch', name: 'invoke', payload: 'payload', meta: { a: 1 } }, expectation);
    });
    test('meta is optional', () => {
        const createSatisfier = _1.createScopedCreateExpectation('x');
        const s = createSatisfier('node-fetch', 'invoke');
        const expectation = s('payload');
        assertron_1.default.satisfy({ type: 'x/node-fetch', name: 'invoke', payload: 'payload' }, expectation);
    });
});
//# sourceMappingURL=SpecExpectation.spec.js.map