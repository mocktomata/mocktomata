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
var assert_1 = __importDefault(require("assert"));
var assertron_1 = __importDefault(require("assertron"));
var timers_1 = require("timers");
var __1 = require("../..");
var test_util_1 = __importDefault(require("../../test-util"));
var Foo = /** @class */ (function () {
    function Foo(x) {
        this.x = x;
    }
    Foo.prototype.getValue = function () {
        return this.x;
    };
    Foo.prototype.doThrow = function () {
        throw new Error('throwing');
    };
    return Foo;
}());
var Boo = /** @class */ (function (_super) {
    __extends(Boo, _super);
    function Boo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Boo.prototype.getPlusOne = function () {
        return this.getValue() + 1;
    };
    return Boo;
}(Foo));
describe('use cases', function () {
    test('acceptance test', function () { return __awaiter(_this, void 0, void 0, function () {
        var s, foo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.spec('class acceptance test', Foo)];
                case 1:
                    s = _a.sent();
                    foo = new s.subject(1);
                    foo.getValue();
                    assert_1.default.throws(function () { return foo.doThrow(); });
                    return [4 /*yield*/, s.done()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_util_1.default.trio('each instance of class will get its own instanceId', function (title, spec) {
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var s, f1, f2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, spec(Foo)];
                case 1:
                    s = _a.sent();
                    f1 = new s.subject(1);
                    f2 = new s.subject(2);
                    f1.getValue();
                    f2.getValue();
                    return [4 /*yield*/, s.done()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test('simple class simulate with different constructor will throw', function () { return __awaiter(_this, void 0, void 0, function () {
    var s;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, __1.spec.simulate('class/wrongConstructorCall', Foo)];
            case 1:
                s = _a.sent();
                assertron_1.default.throws(function () { return new s.subject(2); }, __1.SimulationMismatch);
                return [2 /*return*/];
        }
    });
}); });
test_util_1.default.trio('class/simple', function (title, spec) {
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var s, foo, actual;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, spec(Foo)];
                case 1:
                    s = _a.sent();
                    foo = new s.subject(1);
                    actual = foo.getValue();
                    assert_1.default.strictEqual(actual, 1);
                    return [4 /*yield*/, s.done()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_util_1.default.trio('class/extend', function (title, spec) {
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var s, boo, actual;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, spec(Boo)];
                case 1:
                    s = _a.sent();
                    boo = new s.subject(1);
                    actual = boo.getPlusOne();
                    assert_1.default.strictEqual(actual, 2);
                    return [4 /*yield*/, s.done()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
var WithCallback = /** @class */ (function () {
    function WithCallback() {
    }
    WithCallback.prototype.callback = function (cb) {
        timers_1.setImmediate(function () {
            cb('called');
        });
    };
    WithCallback.prototype.justDo = function (x) {
        return x;
    };
    return WithCallback;
}());
test_util_1.default.trio('class/withCallback', function (title, spec) {
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var s, cb;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, spec(WithCallback)];
                case 1:
                    s = _a.sent();
                    cb = new s.subject();
                    cb.justDo(1);
                    return [4 /*yield*/, new Promise(function (a) {
                            cb.callback(function (v) {
                                assert_1.default.strictEqual(v, 'called');
                            });
                            cb.callback(function (v) {
                                assert_1.default.strictEqual(v, 'called');
                                a();
                            });
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, s.done()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
var WithPromise = /** @class */ (function () {
    function WithPromise() {
    }
    WithPromise.prototype.increment = function (x) {
        return new Promise(function (a) {
            timers_1.setImmediate(function () { return a(x + 1); });
        });
    };
    return WithPromise;
}());
test_util_1.default.trio('method returning promise should have result of promise saved in payload', function (title, spec) {
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var s, p, actual;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, spec(WithPromise)];
                case 1:
                    s = _a.sent();
                    p = new s.subject();
                    return [4 /*yield*/, p.increment(3)];
                case 2:
                    actual = _a.sent();
                    assert_1.default.strictEqual(actual, 4);
                    return [4 /*yield*/, s.done()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
var Throwing = /** @class */ (function () {
    function Throwing() {
    }
    Throwing.prototype.doThrow = function () {
        throw new Error('thrown');
    };
    return Throwing;
}());
test_util_1.default.trio('class: method throws', function (title, spec) {
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var s, o;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, spec(Throwing)];
                case 1:
                    s = _a.sent();
                    o = new s.subject();
                    assertron_1.default.throws(function () { return o.doThrow(); });
                    return [4 /*yield*/, s.done()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
var Promising = /** @class */ (function () {
    function Promising() {
    }
    Promising.prototype.do = function (x) {
        return new Promise(function (a) {
            timers_1.setImmediate(function () { return a(x); });
        });
    };
    return Promising;
}());
test_util_1.default.trio('class: async promise call', function (title, spec) {
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var s, p, calls;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, spec(Promising)
                    // s.onAny(a => {
                    //   console.info(`${a.type} ${a.name} ${a.instanceId} ${a.invokeId || ''}`)
                    // })
                ];
                case 1:
                    s = _a.sent();
                    p = new s.subject();
                    calls = [1, 2].map(function (x) { return p.do(x); });
                    return [4 /*yield*/, Promise.all(calls)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, p.do(3)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, s.done()];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
var InvokeInternal = /** @class */ (function () {
    function InvokeInternal() {
    }
    InvokeInternal.prototype.do = function () {
        return this.internal();
    };
    InvokeInternal.prototype.internal = function () {
        return 'do';
    };
    return InvokeInternal;
}());
test_util_1.default.trio('internal method invocation will not be recorded', function (title, spec) {
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var s, a;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, spec(InvokeInternal)];
                case 1:
                    s = _a.sent();
                    a = new s.subject();
                    assert_1.default.strictEqual(a.do(), 'do');
                    return [4 /*yield*/, s.done()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_util_1.default.trio('capture parent class call', function (title, spec) {
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var Parent, Child, s, a;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Parent = /** @class */ (function () {
                        function Parent() {
                        }
                        Parent.prototype.do = function () { return 'do'; };
                        return Parent;
                    }());
                    Child = /** @class */ (function (_super) {
                        __extends(Child, _super);
                        function Child() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        return Child;
                    }(Parent));
                    return [4 /*yield*/, spec(Child)];
                case 1:
                    s = _a.sent();
                    a = new s.subject();
                    assert_1.default.strictEqual(a.do(), 'do');
                    return [4 /*yield*/, s.done()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_util_1.default.trio('should not record inner call when using Promise', function (title, spec) {
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var PromiseInner, s, a, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    PromiseInner = /** @class */ (function () {
                        function PromiseInner() {
                        }
                        PromiseInner.prototype.do = function () {
                            var _this = this;
                            return new Promise(function (a) {
                                timers_1.setImmediate(function () {
                                    a(_this.inner());
                                });
                            });
                        };
                        PromiseInner.prototype.inner = function () {
                            return 'inner';
                        };
                        return PromiseInner;
                    }());
                    return [4 /*yield*/, spec(PromiseInner)];
                case 1:
                    s = _c.sent();
                    a = new s.subject();
                    _b = (_a = assert_1.default).strictEqual;
                    return [4 /*yield*/, a.do()];
                case 2:
                    _b.apply(_a, [_c.sent(), 'inner']);
                    return [4 /*yield*/, s.done()];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test('promise should not invoke actual code', function () { return __awaiter(_this, void 0, void 0, function () {
    var PromiseInner, s, a, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                PromiseInner = /** @class */ (function () {
                    function PromiseInner() {
                    }
                    PromiseInner.prototype.do = function () {
                        throw new Error('should not call');
                        // return new Promise(a => {
                        //   setImmediate(() => {
                        //     a(this.inner() as any)
                        //   })
                        // })
                    };
                    PromiseInner.prototype.inner = function () {
                        return 'inner';
                    };
                    return PromiseInner;
                }());
                return [4 /*yield*/, __1.spec.simulate('class/simulateNotInvokeInner', PromiseInner)];
            case 1:
                s = _c.sent();
                a = new s.subject();
                // tslint:disable-next-line
                _b = (_a = assert_1.default).strictEqual;
                return [4 /*yield*/, a.do()];
            case 2:
                // tslint:disable-next-line
                _b.apply(_a, [_c.sent(), 'inner']);
                return [4 /*yield*/, s.done()];
            case 3:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
// To think: should anything be created if the spec is not being accessed?
// k.trio('class: not using spec', (title, spec) => {
//   test(title, async () => {
//     class Foo { foo() { return 'foo' } }
//     function call(_foo: any) {
//       return 'called'
//     }
//     const s = await spec(Foo)
//     const foo = new s.subject()
//     t.strictEqual(call(foo), 'called')
//     await s.satisfy([
//       { ...classConstructed('Foo'), instanceId: 1 }
//     ])
//   })
// })
var Echo = /** @class */ (function () {
    function Echo() {
    }
    Echo.prototype.echo = function (x) {
        return new Promise(function (_, r) {
            timers_1.setImmediate(function () { return r(x); });
            // setTimeout(() => {
            //   if (x > 200) {
            //     r(x)
            //   }
            //   else {
            //     a(x)
            //   }
            // }, x)
        });
    };
    return Echo;
}());
describe('prevent runaway promise', function () {
    test('setup runaway', function () { return __awaiter(_this, void 0, void 0, function () {
        var s, e;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.spec('class: setup runaway', Echo)];
                case 1:
                    s = _a.sent();
                    e = new s.subject();
                    return [2 /*return*/, assertron_1.default.throws(e.echo(300), function (v) { return v === 300; })];
            }
        });
    }); });
    test('no runaway promise to break this test', function () {
        return new Promise(function (a) { return timers_1.setImmediate(function () { return a(); }); });
    });
});
var WithCircular = /** @class */ (function () {
    function WithCircular() {
        this.cirRef = this;
    }
    return WithCircular;
}());
var ClassWithCircular = /** @class */ (function () {
    function ClassWithCircular() {
        this.channel = new WithCircular();
    }
    ClassWithCircular.prototype.exec = function (cmd, cb) {
        this.channel.value = cmd;
        cb(this.channel);
    };
    return ClassWithCircular;
}());
test_util_1.default.trio('class with circular reference', function (title, spec) {
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var s, f, actual;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, spec(ClassWithCircular)];
                case 1:
                    s = _a.sent();
                    f = new s.subject();
                    f.exec('echo', function (data) {
                        actual = data.value;
                    });
                    assert_1.default.strictEqual(actual, 'echo');
                    return [4 /*yield*/, s.done()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_util_1.default.trio('class with circular reference accessing', function (title, spec) {
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var s, f, actual;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, spec(ClassWithCircular)];
                case 1:
                    s = _a.sent();
                    f = new s.subject();
                    f.exec('echo', function (data) {
                        actual = data.cirRef.value;
                    });
                    assert_1.default.strictEqual(actual, 'echo');
                    return [4 /*yield*/, s.done()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
var Channel = /** @class */ (function () {
    function Channel() {
        this.listeners = [];
        this.stdio = this;
    }
    Channel.prototype.on = function (listener) {
        this.listeners.push(listener);
    };
    Channel.prototype.emit = function (data) {
        this.listeners.forEach(function (l) { return l(data); });
    };
    return Channel;
}());
var Ssh = /** @class */ (function () {
    function Ssh() {
        this.channel = new Channel();
    }
    Ssh.prototype.exec = function (cmd, cb) {
        cb(this.channel);
        this.channel.stdio.emit(cmd);
    };
    return Ssh;
}());
// TODO: throws NotSupported error for callback with complex object.
// This gives indication to the user that a plugin is need to support this subject
test_util_1.default.trio('callback with complex object', function (title, spec) {
    test.skip(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var s, f, actual;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, spec(Ssh)];
                case 1:
                    s = _a.sent();
                    f = new s.subject();
                    f.exec('echo', function (channel) {
                        // can't create channel with stdio.on() from data
                        // unless start doing new Function(...)
                        channel.stdio.on(function (data) { return actual = data; });
                    });
                    assert_1.default.strictEqual(actual, 'echo');
                    return [4 /*yield*/, s.done()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_util_1.default.trio('class/callbackWithComposite', function (title, spec) {
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var Foo, fn, s, f, actual;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Foo = /** @class */ (function () {
                        function Foo() {
                        }
                        Foo.prototype.on = function (compositeFn) {
                            return this.internal(compositeFn);
                        };
                        Foo.prototype.internal = function (input) {
                            assert_1.default.strictEqual(input.value, 'xyz');
                            return input;
                        };
                        return Foo;
                    }());
                    fn = Object.assign(function () { return; }, {
                        value: 'xyz'
                    });
                    return [4 /*yield*/, spec(Foo)];
                case 1:
                    s = _a.sent();
                    f = new s.subject();
                    actual = f.on(fn);
                    assert_1.default.strictEqual(actual.value, 'xyz');
                    return [4 /*yield*/, s.done()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_util_1.default.trio('class/withProperty', function (title, spec) {
    var WithProperty = /** @class */ (function () {
        function WithProperty() {
            this.y = 1;
        }
        WithProperty.prototype.do = function (x) { return x; };
        return WithProperty;
    }());
    test(title, function () { return __awaiter(_this, void 0, void 0, function () {
        var s, p;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, spec(WithProperty)];
                case 1:
                    s = _a.sent();
                    p = new s.subject();
                    assert_1.default.strictEqual(p.do(2), 2);
                    assert_1.default.strictEqual(p.y, 1);
                    p.y = 3;
                    assert_1.default.strictEqual(p.y, 3);
                    return [4 /*yield*/, s.done()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=class.spec.js.map