import a from 'assertron';
import * as es2015 from './es2015';
import { loadPlugins } from './spec/loadPlugins';
import { callbackInDeepObjLiteral, callbackInObjLiteral, delayed, postReturn, recursive, simpleCallback, synchronous } from './test-artifacts';
import k, { TestHarness } from './test-utils';

let harness: TestHarness
beforeAll(async () => {
  harness = k.createTestHarness()
  harness.io.addPluginModule('@komondor-lab/es2015', es2015)
  await loadPlugins(harness)
})

describe('function', () => {
  k.duo('no input no result', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(() => { })
      expect(subject()).toBeUndefined()

      await spec.done()
    })
  })
  k.duo('string input no result', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock((_x: string) => { })
      expect(subject('abc')).toBeUndefined()

      await spec.done()
    })
  })
  k.save('string input returns same string', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock((x: string) => x)
      expect(subject('abc')).toEqual('abc')

      await spec.done()
    })
  })
  k.duo('no input, string result', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(() => 'abc')
      const actual = subject()
      expect(actual).toBe('abc')

      await spec.done()
    })
  })
  k.duo('undefined input, undefined result', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock((_a: any, _b: any) => undefined)
      const actual = subject(undefined, undefined)
      expect(actual).toBe(undefined)
      await spec.done()
    })
  })
  k.duo('primitive inputs, simple result', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock((x: number, y: number) => x + y)
      const actual = subject(1, 2)

      expect(actual).toBe(3)

      await spec.done()
    })
  })
  k.duo('throwing error', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(() => { throw new Error('failed') })
      const err = a.throws(() => subject())

      expect(err.message).toBe('failed')

      await spec.done()
    })
  })
  k.duo('immediate invoke callback', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(simpleCallback.success)
      let actual
      subject(2, (_, result) => {
        actual = result
      })

      expect(actual).toBe(3)

      await spec.done()
    })
  })
  k.duo('immediate invoke throwing callback', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(simpleCallback.fail)

      const err = await a.throws(simpleCallback.increment(subject, 2))

      expect(err.message).toBe('fail')

      await spec.done()
    })
  })
  k.duo('simple callback invoked multiple times', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(simpleCallback.success)

      expect(await simpleCallback.increment(subject, 2)).toBe(3)
      expect(await simpleCallback.increment(subject, 4)).toBe(5)

      await spec.done()
    })
  })
  k.duo('delayed callback invocation', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(delayed.success)

      expect(await delayed.increment(subject, 2)).toBe(3)
      expect(await delayed.increment(subject, 4)).toBe(5)

      await spec.done()
    })
  })
  k.duo('callback in object literal success', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(callbackInObjLiteral.success)

      expect(await callbackInObjLiteral.increment(subject, 2)).toBe(3)

      await spec.done()
    })
  })
  k.duo('callback in object literal fail', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(callbackInObjLiteral.fail)

      const err = await a.throws(callbackInObjLiteral.increment(subject, 2), Error)

      expect(err.message).toBe('fail')

      await spec.done()
    })
  })
  k.duo('callback in deep object literal success', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(callbackInDeepObjLiteral.success)

      expect(await callbackInDeepObjLiteral.increment(subject, 2)).toBe(3)
      expect(await callbackInDeepObjLiteral.increment(subject, 4)).toBe(5)

      await spec.done()
    })
  })
  k.duo('synchronous callback success', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(synchronous.success)

      expect(synchronous.increment(subject, 3)).toBe(4)

      await spec.done()
    })
  })
  k.duo('synchronous callback throws', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(synchronous.fail)

      const err = a.throws(() => synchronous.increment(subject, 3))

      expect(err.message).toBe('fail')

      await spec.done()
    })
  })
  k.duo('recursive two calls success', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(recursive.success)

      const actual = await recursive.decrementToZero(subject, 2)

      expect(actual).toBe(0)

      await spec.done()
    })
  })
  k.duo('invoke callback after returns', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(postReturn.fireEvent)

      await new Promise(a => {
        let called = 0
        subject('event', 3, () => {
          called++
          if (called === 3)
            a()
        })
      })

      await spec.done()
    })
  })
  k.duo('function with array arguments', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(function takeArray(name: string, args: string[]) { return { name, args } })
      const actual = subject('node', ['--version'])

      expect(actual.name).toBe('node')
      expect(actual.args).toEqual(['--version'])

      await spec.done()
    })
  })
  k.duo('function with static prop', (title, spec) => {
    test(title, async () => {
      const fn = Object.assign(function () { }, { a: 1 })

      const mock = await spec.mock(fn)
      expect(mock.a).toBe(1)

      await spec.done()
    })
  })
  test.todo('function with static prop')
})

describe('object', () => {
  k.duo('get primitive property', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock({ a: 1 })
      const actual = subject.a

      expect(actual).toBe(1)

      await spec.done()
    })
  })
  k.duo('set primitive property', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock({ a: 1 })
      const actual = subject.a = 2

      expect(actual).toBe(2)

      await spec.done()
    })
  })
  k.duo('update primitive property', (title, spec) => {
    test.skip(title, async () => {
      const subject = await spec.mock({ a: 1 })
      expect(subject.a).toBe(1)
      subject.a = 2
      expect(subject.a).toBe(2)
      await spec.done()
    })
  })
  k.duo('primitive method', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock({ echo: (x: number) => x })
      const actual = subject.echo(3)

      expect(actual).toBe(3)

      await spec.done()
    })
  })
  k.duo('primitive method throws error', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock({ echo: (x: string) => { throw new Error(x) } })
      const err = a.throws(() => subject.echo('abc'))

      expect(err.message).toBe('abc')

      await spec.done()
    })
  })
  k.duo('callback method success', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock({
        inc(x: number, cb: (x: number) => void) {
          cb(x + 1)
        }
      })
      let actual: number
      subject.inc(3, x => actual = x)

      expect(actual!).toBe(4)

      await spec.done()
    })
  })
})

describe('promise', () => {
  const promise = {
    increment(remote: any, x: number) {
      return remote('increment', x)
    },
    success(_url: string, x: number) {
      return Promise.resolve(x + 1)
    },
    fail() {
      return Promise.reject(new Error('expected error'))
    }
  }

  const promiseChain = {
    increment(remote: any, x: number) {
      return remote('increment', x)
    },
    success(_url: string, x: number) {
      return new Promise(a => {
        setTimeout(a, 1)
      }).then(() => Promise.resolve(() => x + 1))
    },
    fail() {
      return new Promise(a => {
        setTimeout(a, 1)
      }).then(() => Promise.reject(() => new Error('expected error')))
    }
  }

  const noReturn = {
    doSomething(remote: Function) {
      return remote()
    },
    success() {
      return Promise.resolve()
    }
  }

  k.duo('resolve with no value', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(noReturn.success)
      await noReturn.doSomething(subject).then(() => spec.done())
    })
  })

  k.duo('resolve with value', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(promise.success)
      // not using `await` to make sure the return value is a promise.
      // `await` will hide the error if the return value is not a promise.
      return promise.increment(subject, 2)
        .then((actual: number) => {
          expect(actual).toBe(3)
          return spec.done()
        })
    })
  })

  k.duo('reject with error', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(promise.fail)
      return promise.increment(subject, 2)
        .then(() => { throw new Error('should not reach') })
        .catch(async (e: Error) => {
          expect(e.message).toBe('expected error')
          await spec.done()
        })
    })
  })

  k.duo('promise with callback in between', (title, spec) => {
    test(title, async () => {
      function foo(x: number, cb: Function) {
        return new Promise(a => {
          setTimeout(() => {
            cb('called')
            a(x + 1)
          }, 10)
        })
      }
      const subject = await spec.mock(foo);

      let fooing: any
      return new Promise(a => {
        fooing = subject(2, (msg: string) => {
          expect(msg).toBe('called')
          a()
        })
      })
        .then(() => fooing)
        .then(actual => {
          expect(actual).toBe(3)
          return spec.done()
        })
    })
  })

  k.duo('promise resolves to function', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(promiseChain.success)
      // not using `await` to make sure the return value is a promise.
      // `await` will hide the error if the return value is not a promise.
      return promise.increment(subject, 2)
        .then(async (actualFn: Function) => {
          expect(actualFn()).toBe(3)
          await spec.done()
        })
    })
  })
})

describe('class', () => {
  class Foo {
    constructor(public x: number) { }
    getValue() {
      return this.x
    }
  }

  class Boo extends Foo {
    getPlusOne() {
      return this.getValue() + 1
    }
  }

  k.duo('invoke declared method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec.mock(Foo)
      const instance = new Subject(1)
      expect(instance.getValue()).toBe(1)
      await spec.done()
    })
  })

  k.duo('invoke inherited method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec.mock(Boo)

      const instance = new Subject(1)
      expect(instance.getPlusOne()).toBe(2)
      await spec.done()
    })
  })

  k.duo('invoke parent method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec.mock(Boo)

      const instance = new Subject(1)
      expect(instance.getValue()).toBe(1)
      await spec.done()
    })
  })

  k.duo('create multiple instances of the same class', (title, spec) => {
    test(title, async () => {
      const Subject = await spec.mock(Foo)
      const f1 = new Subject(1)
      const f2 = new Subject(2)
      expect(f1.getValue()).toBe(1)
      expect(f2.getValue()).toBe(2)
      await spec.done()
    })
  })

  k.free('ok to use super/sub-class as long as behavior is the same', (title, spec) => {
    // It is ok to use diff
    test(title, async () => {
      const save = spec.save()
      const bs = await save.mock(Boo)
      const boo = new bs(2)
      expect(boo.getValue()).toBe(2)
      await save.done()

      const sim = spec.simulate()
      const fs = await sim.mock(Foo)
      const foo = new fs(2)
      expect(foo.getValue()).toBe(2)
      await sim.done()
    })
  })

  class WithCallback {
    callback(cb: (value: number) => void) {
      setImmediate(() => {
        cb(1)
      })
    }
    justDo(x: any) {
      return x
    }
  }
  k.duo('class method with callback', (title, spec) => {
    test(title, async () => {
      const s = await spec.mock(WithCallback)
      const cb = new s()

      expect(cb.justDo(1)).toBe(1)
      expect(await new Promise(a => {
        let total = 0
        cb.callback(v => total += v)
        cb.callback(v => a(total + v))
      })).toBe(2)
      await spec.done()
    })
  })

  class Throwing {
    doThrow() {
      throw new Error('thrown')
    }
  }

  k.duo('invoke method throws', (title, spec) => {
    test(title, async () => {
      const Subject = await spec.mock(Throwing)
      const foo = new Subject()
      a.throws(() => foo.doThrow(), e => e.message === 'thrown')
      await spec.done()
    })
  })

  class ResolvedPromise {
    increment(x: number) {
      return Promise.resolve(x + 1)
    }
  }

  class DelayedPromise {
    increment(x: number) {
      return new Promise(a => {
        setImmediate(() => a(x + 1))
      })
    }
  }
  k.duo('method return resolved promise', (title, spec) => {
    test(title, async () => {
      const Subject = await spec.mock(ResolvedPromise)
      const p = new Subject()
      expect(await p.increment(3)).toBe(4)

      await spec.done()
    })
  })

  k.duo('method returns delayed promise', (title, spec) => {
    test(title, async () => {
      const Subject = await spec.mock(DelayedPromise)
      const p = new Subject()
      expect(await p.increment(3)).toBe(4)

      await spec.done()
    })
  })

  k.duo('invoke method returns delayed promise multiple times', (title, spec) => {
    test(title, async () => {
      const Subject = await spec.mock(DelayedPromise)
      const p = new Subject()
      expect(await Promise.all([p.increment(1), p.increment(3), p.increment(7)])).toEqual([2, 4, 8])

      await spec.done()
    })
  })

  class InvokeInternal {
    do() {
      return this.internal()
    }
    internal() {
      return 'data'
    }
  }

  k.duo('method invokes internal method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec.mock(InvokeInternal)
      const a = new Subject()
      expect(a.do()).toBe('data')

      await spec.done()
    })
  })

  class DelayedInvokeInternal {
    getDelayedInner(delay = 0) {
      return new Promise(a => {
        setTimeout(() => {
          a(this.inner())
        }, delay)
      })
    }
    inner() {
      return 'inner'
    }
  }

  k.duo('method delay invokes internal method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec.mock(DelayedInvokeInternal)
      const a = new Subject()
      expect(await a.getDelayedInner()).toBe('inner')
      expect(a.inner()).toBe('inner')

      await spec.done()
    })
  })

  class DIIThrow {
    getDelayedInner() {
      throw new Error('should not call')
    }
  }

  k.free('actual method is not invoked during simulation', (title, spec) => {
    test(title, async () => {
      const save = spec.save()
      const Subject = await save.mock(DelayedInvokeInternal)
      const dii = new Subject()

      expect(await dii.getDelayedInner()).toBe('inner')
      await save.done()

      const sim = spec.simulate()
      const BadSubject = await sim.mock(DIIThrow)
      const bad = new BadSubject()
      expect(await bad.getDelayedInner()).toBe('inner')
      await sim.done()
    })
  })

  class RejectLeak {
    reject(x: number) {
      return new Promise((_, r) => {
        setImmediate(() => r(x))
      })
    }
  }

  k.duo('run away promise will not be leaked and break another test', (title, spec) => {
    test(`${title}: setup`, async () => {
      const MockRejector = await spec.mock(RejectLeak)
      const e = new MockRejector()
      await a.throws(e.reject(300), v => v === 300)
      await spec.done()
    })
    test(`${title}: should not fail`, () => {
      return new Promise(a => setImmediate(() => a()))
    })
  })

  class WithCircular {
    value: any
    cirRef: WithCircular
    constructor() {
      this.cirRef = this
    }
  }

  class ClassWithCircular {
    channel: WithCircular
    constructor() {
      this.channel = new WithCircular()
    }
    exec(cmd: string, cb: Function) {
      this.channel.value = cmd
      cb(this.channel)
    }
  }

  k.duo('can use class with circular reference', (title, spec) => {
    test(title, async () => {
      const Subject = await spec.mock(ClassWithCircular)
      const f = new Subject()

      let actual
      f.exec('echo', (data: any) => {
        actual = data.value
      })

      expect(actual).toBe('echo')
      await spec.done()
    })
  })

  k.duo('class with circular reference accessing', (title, spec) => {
    test(title, async () => {
      const Subject = await spec.mock(ClassWithCircular)
      const f = new Subject()

      let actual
      f.exec('echo', (channel: WithCircular) => {
        actual = channel.cirRef.value
      })

      expect(actual).toBe('echo')
      await spec.done()
    })
  })

  class Channel {
    listeners: any[] = []
    stdio: any
    constructor() {
      this.stdio = this
    }
    on(listener: any) {
      this.listeners.push(listener)
    }
    emit(data: any) {
      this.listeners.forEach(l => l(data))
    }
  }

  class Ssh {
    channel: Channel
    constructor() {
      this.channel = new Channel()
    }
    exec(cmd: string, cb: Function) {
      cb(this.channel)
      this.channel.stdio.emit(cmd)
    }
  }

  // TODO: throws NotSupported error for callback with complex object.
  // This gives indication to the user that a plugin is need to support this subject
  // To fix this, I need to:
  // 1. get property key and value from object without invoking getter.
  // 2. Add GetAction SetAction back
  k.duo('callback with complex object', (title, spec) => {
    test.skip(title, async () => {
      const Subject = await spec.mock(Ssh)
      const f = new Subject()

      let actual
      f.exec('echo', (channel: any) => channel.stdio.on((data: any) => actual = data))

      expect(actual).toBe('echo')
      await spec.done()
      harness.logSpec(title)
      harness.showLog()
    })
  })

  k.duo('class/callbackWithComposite', (title, spec) => {
    test(title, async () => {
      class Foo {
        on(compositeFn: any) {
          return this.internal(compositeFn)
        }
        internal(input: any) {
          expect(input.value).toBe('xyz')
          return input
        }
      }
      const fn = Object.assign(
        function () { return },
        {
          value: 'xyz'
        }
      )
      const s = await spec.mock(Foo)
      const f = new s()
      const actual = f.on(fn)

      expect(actual.value).toBe('xyz')

      await spec.done()
    })
  })

  k.duo('class/withProperty', (title, spec) => {
    class WithProperty {
      y = 1
      do(x: any) { return x }
    }
    test(title, async () => {
      const s = await spec.mock(WithProperty)
      const p = new s()
      expect(p.do(2)).toBe(2)
      expect(p.y).toBe(1)
      p.y = 3
      expect(p.y).toBe(3)
      await spec.done()
    })
  })
})
