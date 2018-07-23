"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:triple-equals
var assert_1 = __importDefault(require("assert"));
var _1 = require(".");
var constants_1 = require("./constants");
test('string', function () {
    var a = _1.artifact('string', 'abc');
    assert_1.default(a == 'abc');
    assert_1.default(a[constants_1.artifactKey]);
});
test('number', function () {
    var a = _1.artifact('number', 1);
    assert_1.default(a == 1);
    assert_1.default(a[constants_1.artifactKey]);
});
test('boolean', function () {
    var a = _1.artifact('boolean', false);
    assert_1.default(a == false);
    assert_1.default(a[constants_1.artifactKey]);
});
test('simple obj', function () {
    var a = _1.artifact('object', { a: 1 });
    assert_1.default(a.a == 1);
    assert_1.default(a[constants_1.artifactKey]);
    assert_1.default(a.a[constants_1.artifactKey]);
});
test('array', function () {
    var a = _1.artifact('array', ['a', 1, true]);
    assert_1.default(a[0] == 'a');
    assert_1.default(a[1] == 1);
    assert_1.default(a[2] == true);
    assert_1.default.strictEqual(a[constants_1.artifactKey], 'array');
    assert_1.default.strictEqual(a[0][constants_1.artifactKey], 'string');
    assert_1.default.strictEqual(a[1][constants_1.artifactKey], 'number');
    assert_1.default.strictEqual(a[2][constants_1.artifactKey], 'boolean');
});
test('obj with function, although this should not be used.', function () {
    var a = _1.artifact('object with function', { foo: function () { return ''; } });
    assert_1.default(a[constants_1.artifactKey]);
    assert_1.default(a.foo[constants_1.artifactKey]);
});
test('every property of an object is an artifact', function () {
    var a = _1.artifact('complex object', {
        string: 'a.b.c',
        boolean: false,
        number: 0,
        array: [0, '', false],
        object: { b: 0 }
    });
    assert_1.default(a.number == 0);
    assert_1.default(a.string == 'a.b.c');
    assert_1.default(a.boolean == false);
    assert_1.default(a.array[0] == 0);
    assert_1.default(a.array[0] == '');
    assert_1.default(a.array[0] == false);
    assert_1.default(a.object.b == 0);
    assert_1.default.strictEqual(a[constants_1.artifactKey], 'object');
    assert_1.default.strictEqual(a.number[constants_1.artifactKey], 'number');
    assert_1.default.strictEqual(a.boolean[constants_1.artifactKey], 'boolean');
    assert_1.default.strictEqual(a.string[constants_1.artifactKey], 'string');
    assert_1.default.strictEqual(a.object[constants_1.artifactKey], 'object');
    assert_1.default.strictEqual(a.object.b[constants_1.artifactKey], 'number');
    assert_1.default.strictEqual(a.array[constants_1.artifactKey], 'array');
    assert_1.default.strictEqual(a.array[0][constants_1.artifactKey], 'number');
    assert_1.default.strictEqual(a.array[1][constants_1.artifactKey], 'string');
    assert_1.default.strictEqual(a.array[2][constants_1.artifactKey], 'boolean');
});
test('no original will throw', function () {
    assert_1.default.throws(function () { return _1.artifact('not defined'); }, _1.MissingArtifact);
});
test('id only will get defined artifact', function () {
    var expected = _1.artifact('defining', { a: 1 });
    var actual = _1.artifact('defining');
    assert_1.default.strictEqual(actual, expected);
});
// When running tests in watch mode,
// changing artifact should take effect.
test('call artifact() again will override', function () {
    _1.artifact('override', { a: 1 });
    var expected = _1.artifact('override', { a: 2 });
    var actual = _1.artifact('override');
    assert_1.default(expected.a == 2);
    assert_1.default.strictEqual(actual, expected);
});
test('overruleArtifact() will cause artifact() to get its value', function () {
    var expected = _1.overruleArtifact('overrule', { a: 1 });
    var actual = _1.artifact('overrule', { a: 2 });
    assert_1.default.strictEqual(actual, expected);
});
test('pass to subject as original type', function () { return __awaiter(_this, void 0, void 0, function () {
    function retainType(value) {
        return __awaiter(this, void 0, void 0, function () {
            var type, a, s;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        type = typeof value;
                        a = _1.artifact("retain type (" + type + ")", value);
                        return [4 /*yield*/, _1.spec("pass to subject as original type (" + value + ")", function (input) {
                                assert_1.default.strictEqual(typeof input, type);
                                assert_1.default.deepStrictEqual(input, value);
                            })];
                    case 1:
                        s = _a.sent();
                        s.subject(a);
                        return [2 /*return*/];
                }
            });
        });
    }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, retainType('10.0.0.1')];
            case 1:
                _a.sent();
                return [4 /*yield*/, retainType(123)];
            case 2:
                _a.sent();
                return [4 /*yield*/, retainType(false)];
            case 3:
                _a.sent();
                return [4 /*yield*/, retainType(true)];
            case 4:
                _a.sent();
                return [4 /*yield*/, retainType([1, 2, 'b'])];
            case 5:
                _a.sent();
                return [4 /*yield*/, retainType({ a: 1, b: { c: 3 } })];
            case 6:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// test('pass to subject constructor as original', async () => {
//   class Foo {
//     constructor(public host: string) {
//       t.strictEqual(typeof host, 'string')
//     }
//     connect() {
//       return new Promise(a => {
//         setTimeout(() => a(this.host), 10)
//       })
//     }
//   }
//   const a = artifact('retain type for class', { host: '1.2.3.4' })
//   const s = await spec('pass to subject constructor as original', Foo)
//   const f = new s.subject(a.host)
//   t.strictEqual(await f.connect(), '1.2.3.4')
// })
// test('pass to class method as original', async () => {
//   class Foo {
//     connect(host: string) {
//       return new Promise(a => {
//         setTimeout(() => a(host), 10)
//       })
//     }
//   }
//   const a = artifact('retain type for class method', { host: '1.2.3.4' })
//   const s = await spec('pass to class method as original', Foo)
//   const f = new s.subject()
//   t.strictEqual(await f.connect(a.host), '1.2.3.4')
// })
//# sourceMappingURL=artifact.spec.js.map