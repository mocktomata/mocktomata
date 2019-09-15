import a from 'assertron';
import * as es2015 from './es2015';
import { loadPlugins } from './spec/loadPlugins';
import k, { TestHarness } from './test-utils';
import { simpleCallback, delayed, callbackInObjLiteral, callbackInDeepObjLiteral, synchronous, recursive, postReturn } from './test-artifacts';

let harness: TestHarness
beforeAll(async () => {
  harness = k.createTestHarness()
  harness.io.addPluginModule('@komondor-lab/es2015', es2015)
  await loadPlugins(harness)
})
// afterAll(() => {
//   harness.logSpecs()
// })

describe('function', () => {
  k.duo('no input no result', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(() => { })
      expect(subject()).toBeUndefined()

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
  k.save('primitive method', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock({ echo: (x: number) => x })
      const actual = subject.echo(3)

      expect(actual).toBe(3)

      await spec.done()
    })
  })
  k.save('primitive method throws error', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock({ echo: (x: string) => { throw new Error(x) } })
      const err = a.throws(() => subject.echo('abc'))

      expect(err.message).toBe('abc')

      await spec.done()
    })
  })
  k.save('callback method success', (title, spec) => {
    test.skip(title, async () => {
      harness.showLog()
      const subject = await spec.mock({
        inc(x: number, cb: (x: number) => void) {
          cb(x + 1)
        }
      })
      let actual: number
      subject.inc(3, x => actual = x)

      expect(actual!).toBe(4)

      await spec.done()
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

  k.save('resolve with no value', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(noReturn.success)
      return noReturn.doSomething(subject)
        .then(async () => {
          await spec.done()
        })
    })
  })

  k.save('resolve with value', (title, spec) => {
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

  k.save('reject with error', (title, spec) => {
    test(title, async () => {
      const subject = await spec.mock(promise.fail)
      return promise.increment(subject, 2)
        .then(() => { throw new Error('should not reach') })
        .catch((e: Error) => {
          expect(e.message).toBe('expected error')
          return spec.done()
        })
    })
  })

  k.save('promise with callback in between', (title, spec) => {
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

  k.save('promise/returns/function', (title, spec) => {
    test.skip(title, async () => {
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
