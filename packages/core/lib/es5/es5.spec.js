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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var assertron_1 = __importDefault(require("assertron"));
var es5Module = __importStar(require("."));
var __1 = require("..");
var plugin_1 = require("../plugin");
var spec_1 = require("../spec");
var test_util_1 = __importDefault(require("../test-util"));
var harness;
beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                harness = __1.createTestHarness();
                harness.io.addPluginModule('@komondor-lab/es5', es5Module);
                return [4 /*yield*/, plugin_1.loadPlugins(harness)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
afterAll(function () { return harness.reset(); });
test_util_1.default.live('primitives throws NotSpecable', function (title, spec) {
    test.each([undefined, null, 1, true, Symbol(), 'str'])("%s " + title, function (value) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, assertron_1.default.throws(spec(value), spec_1.NotSpecable)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('es5/function', function () {
    test_util_1.default.trio('function without argument', function (title, spec) {
        test(title, function () { return __awaiter(_this, void 0, void 0, function () {
            var s, actual;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, spec(function () { return 'abc'; })];
                    case 1:
                        s = _a.sent();
                        actual = s.subject();
                        expect(actual).toBe('abc');
                        return [4 /*yield*/, s.done()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    test_util_1.default.trio('function without callback', function (title, spec) {
        test.skip(title, function () { return __awaiter(_this, void 0, void 0, function () {
            var s, actual;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, spec(function (x, y) { return x + y; })];
                    case 1:
                        s = _a.sent();
                        actual = s.subject(1, 2);
                        expect(actual).toBe(3);
                        return [4 /*yield*/, s.done()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    // k.trio('simple callback success (direct)', (title, spec) => {
    //   test(title, async () => {
    //     const s = await spec(simpleCallback.success)
    //     let actual
    //     s.subject(2, (_, result) => {
    //       actual = result
    //     })
    //     expect(actual).toBe(3)
    //     await s.done()
    //   })
    // })
    // k.trio('simple callback success', (title, spec) => {
    //   test(title, async () => {
    //     const s = await spec(simpleCallback.success)
    //     const actual = await simpleCallback.increment(s.subject, 2)
    //     expect(actual).toBe(3)
    //     await s.done()
    //   })
    // })
    // k.trio('simple callback fail', (title, spec) => {
    //   test.only(title, async () => {
    //     const s = await spec(simpleCallback.fail)
    //     const err = await a.throws(simpleCallback.increment(s.subject, 2))
    //     expect(err.message).toBe('fail')
    //     await s.done()
    //     harness.logSpecs()
    //   })
    // })
});
// describe('es5/object', () => {
//   k.trio('get primitive property', (title, spec) => {
//     test(title, async () => {
//       const s = await spec({ a: 1 })
//       const actual = s.subject.a
//       expect(actual).toBe(1)
//       await s.done()
//     })
//   })
// })
// describe('es5/class', () => {
//   class Foo {
//     constructor(public x: any) { }
//     getValue() {
//       return this.x
//     }
//     doThrow() {
//       throw new Error('throwing')
//     }
//   }
//   class Boo extends Foo {
//     getPlusOne() {
//       return this.getValue() + 1
//     }
//   }
//   describe('use cases', () => {
//     test('acceptance test', async () => {
//       const s = await spec('class acceptance test', Foo)
//       const foo = new s.subject(1)
//       foo.getValue()
//       t.throws(() => foo.doThrow())
//       await s.done()
//     })
//   })
//   k.trio('each instance of class will get its own instanceId', (title, spec) => {
//     test(title, async () => {
//       const s = await spec(Foo)
//       const f1 = new s.subject(1)
//       const f2 = new s.subject(2)
//       f1.getValue()
//       f2.getValue()
//       await s.done()
//     })
//   })
//   test('simple class simulate with different constructor will throw', async () => {
//     // const s = await spec.save('class/wrongConstructorCall', Boo)
//     // const boo = new s.subject(2)
//     // t(boo)
//     // await s.done()
//     const s = await spec.simulate('class/wrongConstructorCall', Foo)
//     a.throws(() => new s.subject(2), SimulationMismatch)
//   })
//   k.trio('class/simple', (title, spec) => {
//     test(title, async () => {
//       const s = await spec(Foo)
//       const foo = new s.subject(1)
//       const actual = foo.getValue()
//       t.strictEqual(actual, 1)
//       await s.done()
//     })
//   })
//   k.trio('class/extend', (title, spec) => {
//     test(title, async () => {
//       const s = await spec(Boo)
//       const boo = new s.subject(1)
//       const actual = boo.getPlusOne()
//       t.strictEqual(actual, 2)
//       await s.done()
//     })
//   })
//   class WithCallback {
//     callback(cb: any) {
//       setImmediate(() => {
//         cb('called')
//       })
//     }
//     justDo(x: any) {
//       return x
//     }
//   }
//   k.trio('class/withCallback', (title, spec) => {
//     test(title, async () => {
//       const s = await spec(WithCallback)
//       const cb = new s.subject()
//       cb.justDo(1)
//       await new Promise(a => {
//         cb.callback((v: string) => {
//           t.strictEqual(v, 'called')
//         })
//         cb.callback((v: string) => {
//           t.strictEqual(v, 'called')
//           a()
//         })
//       })
//       await s.done()
//     })
//   })
//   class WithPromise {
//     increment(x: number) {
//       return new Promise(a => {
//         setImmediate(() => a(x + 1))
//       })
//     }
//   }
//   k.trio('method returning promise should have result of promise saved in payload',
//     (title, spec) => {
//       test(title, async () => {
//         const s = await spec(WithPromise)
//         const p = new s.subject()
//         const actual = await p.increment(3)
//         t.strictEqual(actual, 4)
//         await s.done()
//       })
//     })
//   class Throwing {
//     doThrow() {
//       throw new Error('thrown')
//     }
//   }
//   k.trio('class: method throws', (title, spec) => {
//     test(title, async () => {
//       const s = await spec(Throwing)
//       const o = new s.subject()
//       a.throws(() => o.doThrow())
//       await s.done()
//     })
//   })
//   class Promising {
//     do(x: any) {
//       return new Promise(a => {
//         setImmediate(() => a(x))
//       })
//     }
//   }
//   k.trio('class: async promise call', (title, spec) => {
//     test(title, async () => {
//       const s = await spec(Promising)
//       // s.onAny(a => {
//       //   console.info(`${a.type} ${a.name} ${a.instanceId} ${a.invokeId || ''}`)
//       // })
//       const p = new s.subject()
//       const calls = [1, 2].map(x => p.do(x))
//       await Promise.all(calls)
//       await p.do(3)
//       await s.done()
//     })
//   })
//   class InvokeInternal {
//     do() {
//       return this.internal()
//     }
//     internal() {
//       return 'do'
//     }
//   }
//   k.trio('internal method invocation will not be recorded', (title, spec) => {
//     test(title, async () => {
//       const s = await spec(InvokeInternal)
//       const a = new s.subject()
//       t.strictEqual(a.do(), 'do')
//       await s.done()
//     })
//   })
//   k.trio('capture parent class call', (title, spec) => {
//     test(title, async () => {
//       class Parent { do() { return 'do' } }
//       class Child extends Parent { }
//       const s = await spec(Child)
//       const a = new s.subject()
//       t.strictEqual(a.do(), 'do')
//       await s.done()
//     })
//   })
//   k.trio('should not record inner call when using Promise', (title, spec) => {
//     test(title, async () => {
//       class PromiseInner {
//         do() {
//           return new Promise(a => {
//             setImmediate(() => {
//               a(this.inner())
//             })
//           })
//         }
//         inner() {
//           return 'inner'
//         }
//       }
//       const s = await spec(PromiseInner)
//       const a = new s.subject()
//       t.strictEqual(await a.do(), 'inner')
//       await s.done()
//     })
//   })
//   test('promise should not invoke actual code', async () => {
//     class PromiseInner {
//       do() {
//         throw new Error('should not call')
//         // return new Promise(a => {
//         //   setImmediate(() => {
//         //     a(this.inner() as any)
//         //   })
//         // })
//       }
//       inner() {
//         return 'inner'
//       }
//     }
//     const s = await spec.simulate('class/simulateNotInvokeInner', PromiseInner)
//     const a = new s.subject()
//     // tslint:disable-next-line
//     t.strictEqual(await a.do(), 'inner')
//     await s.done()
//   })
//   // To think: should anything be created if the spec is not being accessed?
//   // k.trio('class: not using spec', (title, spec) => {
//   //   test(title, async () => {
//   //     class Foo { foo() { return 'foo' } }
//   //     function call(_foo: any) {
//   //       return 'called'
//   //     }
//   //     const s = await spec(Foo)
//   //     const foo = new s.subject()
//   //     t.strictEqual(call(foo), 'called')
//   //     await s.satisfy([
//   //       { ...classConstructed('Foo'), instanceId: 1 }
//   //     ])
//   //   })
//   // })
//   class Echo {
//     echo(x: any) {
//       return new Promise((_, r) => {
//         setImmediate(() => r(x))
//         // setTimeout(() => {
//         //   if (x > 200) {
//         //     r(x)
//         //   }
//         //   else {
//         //     a(x)
//         //   }
//         // }, x)
//       })
//     }
//   }
//   describe('prevent runaway promise', () => {
//     test('setup runaway', async () => {
//       const s = await spec('class: setup runaway', Echo)
//       const e = new s.subject()
//       return a.throws(e.echo(300), v => v === 300)
//     })
//     test('no runaway promise to break this test', () => {
//       return new Promise(a => setImmediate(() => a()))
//     })
//   })
//   class WithCircular {
//     value: any
//     cirRef: WithCircular
//     constructor() {
//       this.cirRef = this
//     }
//   }
//   class ClassWithCircular {
//     channel: WithCircular
//     constructor() {
//       this.channel = new WithCircular()
//     }
//     exec(cmd: string, cb: Function) {
//       this.channel.value = cmd
//       cb(this.channel)
//     }
//   }
//   k.trio('class with circular reference', (title, spec) => {
//     test(title, async () => {
//       const s = await spec(ClassWithCircular)
//       const f = new s.subject()
//       let actual
//       f.exec('echo', (data: any) => {
//         actual = data.value
//       })
//       t.strictEqual(actual, 'echo')
//       await s.done()
//     })
//   })
//   k.trio('class with circular reference accessing', (title, spec) => {
//     test(title, async () => {
//       const s = await spec(ClassWithCircular)
//       const f = new s.subject()
//       let actual
//       f.exec('echo', (data: any) => {
//         actual = data.cirRef.value
//       })
//       t.strictEqual(actual, 'echo')
//       await s.done()
//     })
//   })
//   class Channel {
//     listeners: any[] = []
//     stdio: any
//     constructor() {
//       this.stdio = this
//     }
//     on(listener: any) {
//       this.listeners.push(listener)
//     }
//     emit(data: any) {
//       this.listeners.forEach(l => l(data))
//     }
//   }
//   class Ssh {
//     channel: Channel
//     constructor() {
//       this.channel = new Channel()
//     }
//     exec(cmd: string, cb: Function) {
//       cb(this.channel)
//       this.channel.stdio.emit(cmd)
//     }
//   }
//   // TODO: throws NotSupported error for callback with complex object.
//   // This gives indication to the user that a plugin is need to support this subject
//   k.trio('callback with complex object', (title, spec) => {
//     test.skip(title, async () => {
//       const s = await spec(Ssh)
//       const f = new s.subject()
//       let actual
//       f.exec('echo', (channel: any) => {
//         // can't create channel with stdio.on() from data
//         // unless start doing new Function(...)
//         channel.stdio.on((data: any) => actual = data)
//       })
//       t.strictEqual(actual, 'echo')
//       await s.done()
//     })
//   })
//   k.trio('class/callbackWithComposite', (title, spec) => {
//     test(title, async () => {
//       class Foo {
//         on(compositeFn: any) {
//           return this.internal(compositeFn)
//         }
//         internal(input: any) {
//           t.strictEqual(input.value, 'xyz')
//           return input
//         }
//       }
//       const fn = Object.assign(
//         function () { return },
//         {
//           value: 'xyz'
//         }
//       )
//       const s = await spec(Foo)
//       const f = new s.subject()
//       const actual = f.on(fn)
//       t.strictEqual(actual.value, 'xyz')
//       await s.done()
//     })
//   })
//   k.trio('class/withProperty', (title, spec) => {
//     class WithProperty {
//       y = 1
//       do(x: any) { return x }
//     }
//     test(title, async () => {
//       const s = await spec(WithProperty)
//       const p = new s.subject()
//       t.strictEqual(p.do(2), 2)
//       t.strictEqual(p.y, 1)
//       p.y = 3
//       t.strictEqual(p.y, 3)
//       await s.done()
//     })
//   })
// })
// describe('es5/promise', () => {
//   import t from 'assert';
//   import a from 'assertron';
//   import { setTimeout } from 'timers';
//   import { spec } from '../..';
//   import k from '../../test-util';
//   const promise = {
//     increment(remote: any, x: number) {
//       return remote('increment', x)
//     },
//     success(_url: string, x: number) {
//       return Promise.resolve(x + 1)
//     },
//     fail() {
//       return Promise.reject(new Error('fail'))
//     }
//   }
//   const promiseChain = {
//     increment(remote: any, x: number) {
//       return remote('increment', x)
//     },
//     success(_url: string, x: number) {
//       return new Promise(a => {
//         setTimeout(a, 1)
//       }).then(() => Promise.resolve(() => x + 1))
//     },
//     fail() {
//       return new Promise(a => {
//         setTimeout(a, 1)
//       }).then(() => Promise.reject(() => new Error('fail')))
//     }
//   }
//   const noReturn = {
//     doSomething(remote: Function) {
//       return remote()
//     },
//     success() {
//       return Promise.resolve()
//     }
//   }
//   function resolving(x: any) {
//     return Promise.resolve(x)
//   }
//   function rejecting(y: any) {
//     return Promise.reject(y)
//   }
//   test('acceptance', async () => {
//     const res = await spec('promise: acceptance resolve', resolving)
//     await res.subject(1)
//     await res.done()
//     const rej = await spec('promise: acceptance reject', rejecting)
//     await a.throws(rej.subject(2))
//     await rej.done()
//   })
//   k.trio('promise/noReturn', (title, spec) => {
//     test(title, async () => {
//       const s = await spec(noReturn.success)
//       return noReturn.doSomething(s.subject)
//         .then(() => {
//           return s.done()
//         })
//     })
//   })
//   k.trio('promise/resolve', (title, spec) => {
//     test(title, async () => {
//       const s = await spec(promise.success)
//       // not using `await` to make sure the return value is a promise.
//       // `await` will hide the error if the return value is not a promise.
//       return promise.increment(s.subject, 2)
//         .then((actual: number) => {
//           t.strictEqual(actual, 3)
//           return s.done()
//         })
//     })
//   })
//   k.trio('promise/reject', (title, spec) => {
//     test(title, async () => {
//       const s = await spec(promise.fail)
//       return promise.increment(s.subject, 2)
//         .then(() => t.fail('should not reach'))
//         .catch(() => {
//           return s.done()
//         })
//     })
//   })
//   k.trio('promise with callback in between', (title, spec) => {
//     test(title, async () => {
//       function foo(x: number, cb: Function) {
//         return new Promise(a => {
//           setTimeout(() => {
//             cb('called')
//             a(x + 1)
//           }, 10)
//         })
//       }
//       const s = await spec(foo);
//       let fooing: any
//       return new Promise(a => {
//         fooing = s.subject(2, (msg: string) => {
//           t.strictEqual(msg, 'called')
//           a()
//         })
//       })
//         .then(() => fooing)
//         .then(actual => {
//           t.strictEqual(actual, 3)
//           return s.done()
//         })
//     })
//   })
//   k.trio('promise/returns/function', (title, spec) => {
//     test(title, async () => {
//       const s = await spec(promiseChain.success)
//       // not using `await` to make sure the return value is a promise.
//       // `await` will hide the error if the return value is not a promise.
//       return promise.increment(s.subject, 2)
//         .then((actualFn: Function) => {
//           t.strictEqual(actualFn(), 3)
//           return s.done()
//         })
//     })
//   })
// })
//# sourceMappingURL=es5.spec.js.map