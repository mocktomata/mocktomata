import a from 'assertron';
import { logLevel } from 'standard-log';
import { komondorTest as k, NotSpecable, TestHarness } from '.';
import * as es5Module from './es5';
import { loadPlugins } from './plugin';
import { callbackInDeepObjLiteral, callbackInObjLiteral, delayed, postReturn, recursive, simpleCallback, synchronous } from './test-artifacts';

let harness: TestHarness
beforeAll(async () => {
  harness = k.createTestHarness()
  harness.io.addPluginModule('@komondor-lab/es5', es5Module)
  await loadPlugins(harness)
})

afterAll(() => harness.reset())

k.trio('primitives cannot be speced directly. Throws NotSpecable', (title, spec) => {
  test.each([undefined, null, 1, true, Symbol(), 'str'])(`%s ${title}`, async (value) => {
    await a.throws(spec(value), NotSpecable)
  })
})

describe('function', () => {
  k.trio('no input no result', (title, spec) => {
    test(title, async () => {
      const s = await spec(() => { })
      const actual = s.subject()
      expect(actual).toBeUndefined()

      await s.done()
    })
  })
  k.trio('no input, string result', (title, spec) => {
    test(title, async () => {
      const s = await spec(() => 'abc')
      const actual = s.subject()
      expect(actual).toBe('abc')

      await s.done()
    })
  })
  k.trio('primitive inputs, simple result', (title, spec) => {
    test(title, async () => {
      const s = await spec((x: number, y: number) => x + y)
      const actual = s.subject(1, 2)

      expect(actual).toBe(3)

      await s.done()
    })
  })
  k.trio('throwing error', (title, spec) => {
    test(title, async () => {
      const s = await spec(() => { throw new Error('failed') })
      const err = a.throws(() => s.subject())

      expect(err.message).toBe('failed')

      await s.done()
    })
  })
  k.trio('simple callback success (direct)', (title, spec) => {
    test(title, async () => {
      const s = await spec(simpleCallback.success)
      let actual
      s.subject(2, (_, result) => {
        actual = result
      })

      expect(actual).toBe(3)

      await s.done()
    })
  })
  k.trio('simple callback success', (title, spec) => {
    test(title, async () => {
      const s = await spec(simpleCallback.success)

      const actual = await simpleCallback.increment(s.subject, 2)

      expect(actual).toBe(3)

      await s.done()
    })
  })
  k.trio('simple callback fail', (title, spec) => {
    test(title, async () => {
      const s = await spec(simpleCallback.fail)

      const err = await a.throws(simpleCallback.increment(s.subject, 2))

      expect(err.message).toBe('fail')

      await s.done()
    })
  })
  k.trio('simple callback invoked multiple times', (title, spec) => {
    test(title, async () => {
      const s = await spec(simpleCallback.success)

      expect(await simpleCallback.increment(s.subject, 2)).toBe(3)
      expect(await simpleCallback.increment(s.subject, 4)).toBe(5)

      await s.done()
    })
  })
  k.trio('delayed callback invocation', (title, spec) => {
    test(title, async () => {
      const s = await spec(delayed.success)

      expect(await delayed.increment(s.subject, 2)).toBe(3)
      expect(await delayed.increment(s.subject, 4)).toBe(5)

      await s.done()
    })
  })
  k.trio('callback in object literal success', (title, spec) => {
    test(title, async () => {
      const s = await spec(callbackInObjLiteral.success)

      expect(await callbackInObjLiteral.increment(s.subject, 2)).toBe(3)

      await s.done()
    })
  })
  k.trio('callback in object literal fail', (title, spec) => {
    test(title, async () => {
      const s = await spec(callbackInObjLiteral.fail)

      const err = await a.throws(callbackInObjLiteral.increment(s.subject, 2), Error)

      expect(err.message).toBe('fail')

      await s.done()
    })
  })
  k.trio('callback in deep object literal success', (title, spec) => {
    test(title, async () => {
      const s = await spec(callbackInDeepObjLiteral.success)

      expect(await callbackInDeepObjLiteral.increment(s.subject, 2)).toBe(3)
      expect(await callbackInDeepObjLiteral.increment(s.subject, 4)).toBe(5)

      await s.done()
    })
  })
  k.trio('synchronous callback success', (title, spec) => {
    test(title, async () => {
      const s = await spec(synchronous.success)

      expect(synchronous.increment(s.subject, 3)).toBe(4)

      await s.done()
    })
  })
  k.trio('synchronous callback throws', (title, spec) => {
    test(title, async () => {
      const s = await spec(synchronous.fail)

      const err = a.throws(() => synchronous.increment(s.subject, 3))

      expect(err.message).toBe('fail')

      await s.done()
    })
  })
  k.trio('recursive two calls success', (title, spec) => {
    test(title, async () => {
      const s = await spec(recursive.success)

      const actual = await recursive.decrementToZero(s.subject, 2)

      expect(actual).toBe(0)

      await s.done()
    })
  })
  k.trio('invoke callback after returns', (title, spec) => {
    test(title, async () => {
      const s = await spec(postReturn.fireEvent)

      await new Promise(a => {
        let called = 0
        s.subject('event', 3, () => {
          called++
          if (called === 3)
            a()
        })
      })

      await s.done()
    })
  })
  k.trio('function with array arguments', (title, spec) => {
    test(title, async () => {
      const s = await spec(function takeArray(name: string, args: string[]) { return { name, args } })
      const actual = s.subject('node', ['--version'])

      expect(actual.name).toBe('node')
      expect(actual.args).toEqual(['--version'])

      await s.done()
    })
  })
  test.todo('function with static prop')
})

describe('object', () => {
  k.trio('get primitive property', (title, spec) => {
    test(title, async () => {
      const s = await spec({ a: 1 })
      const actual = s.subject.a

      expect(actual).toBe(1)

      await s.done()
    })
  })
  k.trio('set primitive property', (title, spec) => {
    test(title, async () => {
      const s = await spec({ a: 1 })
      const actual = s.subject.a = 2

      expect(actual).toBe(2)

      await s.done()
    })
  })
  k.trio('primitive method', (title, spec) => {
    test(title, async () => {
      const s = await spec({ echo: (x: number) => x })
      const actual = s.subject.echo(3)

      expect(actual).toBe(3)

      await s.done()
    })
  })
  k.trio('primitive method throws error', (title, spec) => {
    test(title, async () => {
      const s = await spec({ echo: (x: string) => { throw new Error(x) } })
      const err = a.throws(() => s.subject.echo('abc'))

      expect(err.message).toBe('abc')

      await s.done()
    })
  })
  k.trio('callback method success', (title, spec) => {
    test.skip(title, async () => {
      harness.showLog()
      const s = await spec({
        inc(x: number, cb: (x: number) => void) {
          cb(x + 1)
        }
      })
      let actual: number
      s.subject.inc(3, x => actual = x)

      expect(actual!).toBe(4)

      await s.done()
      harness.logSpecs()
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

  k.trio('resolve with no value', (title, spec) => {
    test(title, async () => {
      const s = await spec(noReturn.success)
      return noReturn.doSomething(s.subject)
        .then(async () => {
          await s.done()
        })
    })
  })

  k.trio('resolve with value', (title, spec) => {
    test(title, async () => {
      const s = await spec(promise.success)
      // not using `await` to make sure the return value is a promise.
      // `await` will hide the error if the return value is not a promise.
      return promise.increment(s.subject, 2)
        .then((actual: number) => {
          expect(actual).toBe(3)
          return s.done()
        })
    })
  })

  k.trio('reject with error', (title, spec) => {
    test(title, async () => {
      const s = await spec(promise.fail)
      return promise.increment(s.subject, 2)
        .then(() => { throw new Error('should not reach') })
        .catch((e: Error) => {
          expect(e.message).toBe('expected error')
          return s.done()
        })
    })
  })

  k.trio('promise with callback in between', (title, spec) => {
    test(title, async () => {
      function foo(x: number, cb: Function) {
        return new Promise(a => {
          setTimeout(() => {
            cb('called')
            a(x + 1)
          }, 10)
        })
      }
      const s = await spec(foo);

      let fooing: any
      return new Promise(a => {
        fooing = s.subject(2, (msg: string) => {
          expect(msg).toBe('called')
          a()
        })
      })
        .then(() => fooing)
        .then(actual => {
          expect(actual).toBe(3)
          return s.done()
        })
    })
  })

  k.trio('promise/returns/function', (title, spec) => {
    test.skip(title, async () => {
      harness.showLog(logLevel.debug)
      const s = await spec(promiseChain.success)
      // not using `await` to make sure the return value is a promise.
      // `await` will hide the error if the return value is not a promise.
      return promise.increment(s.subject, 2)
        .then(async (actualFn: Function) => {
          expect(actualFn()).toBe(3)
          await s.done()
          harness.logSpecs()
        })
    })
  })
})

// describe('es5/class', () => {

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
