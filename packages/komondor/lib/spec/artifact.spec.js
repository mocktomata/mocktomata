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
// tslint:disable:triple-equals
const assert_1 = __importDefault(require("assert"));
const _1 = require(".");
const constants_1 = require("./constants");
test('string', () => {
    const a = _1.artifact('string', 'abc');
    assert_1.default(a == 'abc');
    assert_1.default(a[constants_1.artifactKey]);
});
test('number', () => {
    const a = _1.artifact('number', 1);
    assert_1.default(a == 1);
    assert_1.default(a[constants_1.artifactKey]);
});
test('boolean', () => {
    const a = _1.artifact('boolean', false);
    assert_1.default(a == false);
    assert_1.default(a[constants_1.artifactKey]);
});
test('simple obj', () => {
    const a = _1.artifact('object', { a: 1 });
    assert_1.default(a.a == 1);
    assert_1.default(a[constants_1.artifactKey]);
    assert_1.default(a.a[constants_1.artifactKey]);
});
test('array', () => {
    const a = _1.artifact('array', ['a', 1, true]);
    assert_1.default(a[0] == 'a');
    assert_1.default(a[1] == 1);
    assert_1.default(a[2] == true);
    assert_1.default.strictEqual(a[constants_1.artifactKey], 'array');
    assert_1.default.strictEqual(a[0][constants_1.artifactKey], 'string');
    assert_1.default.strictEqual(a[1][constants_1.artifactKey], 'number');
    assert_1.default.strictEqual(a[2][constants_1.artifactKey], 'boolean');
});
test('obj with function, although this should not be used.', () => {
    const a = _1.artifact('object with function', { foo() { return ''; } });
    assert_1.default(a[constants_1.artifactKey]);
    assert_1.default(a.foo[constants_1.artifactKey]);
});
test('every property of an object is an artifact', () => {
    const a = _1.artifact('complex object', {
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
test('no original will throw', () => {
    assert_1.default.throws(() => _1.artifact('not defined'), _1.MissingArtifact);
});
test('id only will get defined artifact', () => {
    const expected = _1.artifact('defining', { a: 1 });
    const actual = _1.artifact('defining');
    assert_1.default.strictEqual(actual, expected);
});
// When running tests in watch mode,
// changing artifact should take effect.
test('call artifact() again will override', () => {
    _1.artifact('override', { a: 1 });
    const expected = _1.artifact('override', { a: 2 });
    const actual = _1.artifact('override');
    assert_1.default(expected.a == 2);
    assert_1.default.strictEqual(actual, expected);
});
test('overruleArtifact() will cause artifact() to get its value', () => {
    const expected = _1.overruleArtifact('overrule', { a: 1 });
    const actual = _1.artifact('overrule', { a: 2 });
    assert_1.default.strictEqual(actual, expected);
});
test('pass to subject as original type', () => __awaiter(this, void 0, void 0, function* () {
    function retainType(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = typeof value;
            const a = _1.artifact(`retain type (${type})`, value);
            const s = yield _1.spec(`pass to subject as original type (${value})`, (input) => {
                assert_1.default.strictEqual(typeof input, type);
                assert_1.default.deepStrictEqual(input, value);
            });
            s.subject(a);
        });
    }
    yield retainType('10.0.0.1');
    yield retainType(123);
    yield retainType(false);
    yield retainType(true);
    yield retainType([1, 2, 'b']);
    yield retainType({ a: 1, b: { c: 3 } });
}));
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