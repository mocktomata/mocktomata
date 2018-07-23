"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@unional/logging");
const assert_1 = __importDefault(require("assert"));
const assertron_1 = __importDefault(require("assertron"));
const aurelia_logging_memory_1 = require("aurelia-logging-memory");
const delay_1 = __importDefault(require("delay"));
const _1 = require(".");
test('id cannot be an empty string', () => __awaiter(this, void 0, void 0, function* () {
    yield assertron_1.default.throws(() => _1.spec('', { a: 1 }), _1.IDCannotBeEmpty);
    yield assertron_1.default.throws(() => _1.spec.live('', { a: 1 }), _1.IDCannotBeEmpty);
    yield assertron_1.default.throws(() => _1.spec.save('', { a: 1 }), _1.IDCannotBeEmpty);
    yield assertron_1.default.throws(() => _1.spec.simulate('', { a: 1 }), _1.IDCannotBeEmpty);
}));
test(`when test takes longer than 'timeout' to call done(), a warning message will be displayed.`, () => __awaiter(this, void 0, void 0, function* () {
    const appender = new aurelia_logging_memory_1.MemoryAppender();
    try {
        logging_1.addAppender(appender);
        yield _1.spec.save('timeout', () => true, { timeout: 10 });
        yield delay_1.default(30);
        assertron_1.default.satisfies(appender.logs, [{ id: 'komondor', level: 20, messages: ['no action for 10 ms. Did you forget to call done()?'] }]);
    }
    finally {
        logging_1.removeAppender(appender);
    }
}));
test.skip('when there are actions being recorded, the timeout window will slide', () => __awaiter(this, void 0, void 0, function* () {
    const appender = new aurelia_logging_memory_1.MemoryAppender();
    try {
        logging_1.addAppender(appender);
        const s = yield _1.spec.save('timeout', () => true, { timeout: 30 });
        yield delay_1.default(20);
        s.subject();
        yield delay_1.default(20);
        assert_1.default.strictEqual(appender.logs.length, 0);
    }
    finally {
        logging_1.removeAppender(appender);
    }
}));
//# sourceMappingURL=spec.spec.js.map