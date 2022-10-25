import a from 'assertron'
import { EventEmitter } from 'events'
import { AnyFunction } from 'type-plus'
import { ActionMismatch, ExtraAction, ExtraReference, incubator, MissingAction, NotSpecable, SpecIDCannotBeEmpty } from './index.js'
import { InvokeMetaMethodAfterSpec } from './spec/index.js'
import { callbackInDeepObjLiteral, callbackInObjLiteral, ChildOfDummy, delayed, Dummy, fetch, postReturn, recursive, simpleCallback, synchronous, WithProperty, WithStaticMethod, WithStaticProp } from './test-artifacts/index.js'

describe('basic checks', () => {
  incubator.save(`type %s is not specable`, (title, spec) => {
    test.each<[any, any]>([
      ['undefined', undefined],
      ['null', null],
      ['number', 1],
      ['boolean', true],
      ['symbol', Symbol()],
      ['string', 'string'],
      ['array', []]
    ])(title, (_, value) => a.throws(() => spec(value), NotSpecable))
  })
  function noop() { }

  incubator.save('', (_, spec) => {
    test('spec id cannot be empty (save)', () => a.throws(() => spec(noop), SpecIDCannotBeEmpty))
  })

  incubator.simulate('', (_, spec) => {
    test('spec id cannot be empty (simulate)', () => a.throws(() => spec(noop), SpecIDCannotBeEmpty))
  })
  incubator('', (_, spec) => {
    test('spec id cannot be empty (duo)', () => a.throws(() => spec(noop), SpecIDCannotBeEmpty))
  })
  incubator.sequence('', (_, { save, simulate }) => {
    test('spec id cannot be empty (sequence)', async () => {
      await a.throws(() => save(noop), SpecIDCannotBeEmpty)
      await a.throws(() => save(simulate), SpecIDCannotBeEmpty)
    })
  })
})

describe('get', () => {
  incubator.sequence('missing action throws MissingAction', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = { a: 1 }
      const spy = await save(subject)
      expect(spy.a).toBe(1)
      await save.done()
      await simulate(subject)
      a.throws(simulate.done(), MissingAction)
    })
  })
  // @TODO: 💡 not sure if we should support this behavior
  incubator.sequence('extra action not performed before gets value from subject', (title, { save, simulate }) => {
    test.skip(title, async () => {
      const subject = { a: 1, b: 2 }
      const spy = await save(subject)
      expect(spy.a).toBe(1)
      await save.done()
      const stub = await simulate(subject)
      expect(stub.a).toBe(1)
      expect(stub.b).toBe(2)
      await simulate.done()
    })
  })
})

describe('set', () => {
  incubator.sequence('missing action throws MissingAction', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = { a: 1 }
      const spy = await save(subject)
      spy.a = 2
      await save.done()
      await simulate(subject)
      a.throws(simulate.done(), MissingAction)
    })
  })
  incubator.sequence('extra set throws ExtraAction', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = { a: 1 }
      await save(subject)
      await save.done()
      const stub = await simulate(subject)
      a.throws(() => stub.a = 2, ExtraAction)
    })
  })
  incubator.sequence('in place of different action throws MissingAction', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = { a: 1, foo() { } }
      const spy = await save(subject)
      const foo = spy.foo
      expect(spy.a).toBe(1)
      foo()
      await save.done()
      const stub = await simulate(subject)
      stub.foo
      a.throws(() => stub.a = 2, ActionMismatch)
    })
  })
  incubator.sequence('the wrong key throws ActionMismatch', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = { a: 1, b: 1 }
      const spy = await save(subject)
      spy.a = 2
      await save.done()
      const stub = await simulate(subject)
      a.throws(() => stub.b = 2, ActionMismatch)
    })
  })
  incubator.sequence('with wrong number value throws ActionMismatch', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = () => ({ a: 1 })
      const spy = await save(subject)
      spy().a = 2
      await save.done()
      const stub = await simulate(subject)
      a.throws(() => stub().a = 3, ActionMismatch)
    })
  })
  incubator.sequence('with wrong string value throws ActionMismatch', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = { a: 'a' }
      const spy = await save(subject)
      spy.a = 'x'
      await save.done()
      const stub = await simulate(subject)
      a.throws(() => stub.a = 'y', ActionMismatch)
    })
  })
  incubator.sequence('with wrong value type throws ActionMismatch', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = { a: 'a' as any }
      const spy = await save(subject)
      spy.a = '1'
      await save.done()
      const stub = await simulate(subject)
      a.throws(() => stub.a = 1, ActionMismatch)
    })
  })
  incubator.sequence('with function will not trigger ActionMismatch', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = { foo() { } }
      const spy = await save(subject)
      spy.foo = () => { }
      await save.done()

      const stub = await simulate(subject)
      stub.foo = () => { }
      await simulate.done()
    })
  })
})

describe('invoke', () => {
  incubator.sequence('missing call throws MissingAction', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = () => { }
      const spy = await save(subject)
      spy()
      await save.done()

      await simulate(subject)
      await a.throws(simulate.done(), MissingAction)
    })
  })
  incubator.sequence('extra call throws ExtraAction', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = () => { }
      await save(subject)
      await save.done()
      const stub = await simulate(subject)
      a.throws(() => stub(), ExtraAction)
    })
  })
  incubator.sequence('in place of different action throws MissingAction', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = Object.assign(function () { }, { a: 1 })
      const spy = await save(subject)
      spy()
      spy.a = 2
      await save.done()

      const stub = await simulate(subject)
      stub()
      const err = a.throws(() => stub(), ActionMismatch)
      expect(err.expected?.type).toEqual('set')
      expect(err.actual?.type).toEqual('invoke')
    })
  })
  incubator.sequence('TODO: improve error instead of MissingReference', (title, { save, simulate }) => {
    test.skip(title, async () => {
      // This test is not the right test
      // Can't remember what it should be
      const subject = Object.assign(function () { }, { a: 1 })
      const spy = await save(subject)
      spy()
      spy.a = 2
      await save.done()

      const stub = await simulate(subject)
      stub()
      a.throws(() => stub(), ActionMismatch)
    })
  })
  incubator.sequence('with extra param throws ActionMismatch', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = (...args: any[]) => args
      const s = await save(subject)
      s('a')
      await save.done()
      const stub = await simulate(subject)
      a.throws(() => stub('a', 'b'), ActionMismatch)
    })
  })
  incubator.sequence('with missing param throws ActionMismatch', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = (...args: any[]) => args
      const spy = await save(subject)
      spy('a')
      await save.done()
      const stub = await simulate(subject)
      a.throws(() => stub(), ActionMismatch)
    })
  })
  incubator.sequence('with not recorded scope throws ExtraReference', (title, { save, simulate }) => {
    test(title, async () => {
      function subject() { }
      const spy = await save(subject)
      spy()
      await save.done()

      const stub = await simulate(subject)
      a.throws(() => stub.call({}), ExtraReference)
    })
  })
})

describe('instantiate', () => {
  class Subject {
    a = 0
    constructor(..._args: any[]) { }
    // must exist at least one method for class plugin to identify it.
    foo() { }
  }
  incubator.sequence('missing call throws MissingAction', (title, { save, simulate }) => {
    test(title, async () => {
      const spy = await save(Subject)
      new spy()
      await save.done()

      await simulate(Subject)
      await a.throws(simulate.done(), MissingAction)
    })
  })
  incubator.sequence('extra call throws ExtraAction', (title, { save, simulate }) => {
    test(title, async () => {
      await save(Subject)
      await save.done()
      const stub = await simulate(Subject)
      a.throws(() => new stub(), ExtraAction)
    })
  })
  incubator.sequence('in place of different action throws MissingAction', (title, { save, simulate }) => {
    test(title, async () => {
      const spy = await save(Subject)
      new spy().a = 0
      await save.done()

      const stub = await simulate(Subject)
      new stub()
      a.throws(() => new stub(), ActionMismatch)
    })
  })
  incubator.sequence('with extra param throws ActionMismatch', (title, { save, simulate }) => {
    test(title, async () => {
      const spy = await save(Subject)
      new spy('a')
      await save.done()
      const stub = await simulate(Subject)
      a.throws(() => new stub('a', 'b'), ActionMismatch)
    })
  })
  incubator.sequence('with missing param throws ActionMismatch', (title, { save, simulate }) => {
    test(title, async () => {
      const s = await save(Subject)
      new s('a')
      await save.done()
      const stub = await simulate(Subject)
      a.throws(() => new stub(), ActionMismatch)
    })
  })
})

describe('object', () => {
  incubator('get primitive property', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ a: 1 })
      const actual = subject.a

      expect(actual).toBe(1)

      await spec.done()
    })
  })

  incubator('set primitive property', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ a: 1 })
      const actual = subject.a = 2

      expect(actual).toBe(2)

      await spec.done()
    })
  })

  incubator('set object property', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ a: { b: 1 } })
      const actual = subject.a = { b: 2 }

      expect(actual).toEqual({ b: 2 })

      await spec.done()
    })
  })

  incubator('set function property', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ a: (v: number) => v })
      const actual = subject.a = (v: number) => v + 1

      expect(actual(1)).toEqual(2)

      await spec.done()
    })
  })

  incubator('set null property', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ a: { b: 1 } as any })
      const actual = subject.a = null

      expect(actual).toEqual(null)

      await spec.done()
    })
  })

  incubator('update primitive property', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ a: 1 })
      expect(subject.a).toBe(1)
      subject.a = 2
      expect(subject.a).toBe(2)
      await spec.done()
    })
  })

  incubator('throw during get', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ get x() { throw new Error('thrown') } })
      a.throws(() => subject.x, e => e.message === 'thrown')
      await spec.done()
    })
  })

  incubator('throw during set', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ set x(_: number) { throw new Error('thrown') } })
      a.throws(() => subject.x = 2, e => e.message === 'thrown')
      await spec.done()
    })
  })

  incubator('handles property changes type from value to function', (title, spec) => {
    test(title, async () => {
      const subject: any = await spec({ do: 1 })
      subject.do = (v: number) => v
      expect(subject.do(3)).toBe(3)
      await spec.done()
    })
  })

  incubator('primitive method', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ echo: (x: number) => x })
      const actual = subject.echo(3)

      expect(actual).toBe(3)

      await spec.done()
    })
  })

  incubator('primitive method throws error', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ echo: (x: string) => { throw new Error(x) } })
      const err = a.throws(() => subject.echo('abc'))

      expect(err.message).toBe('abc')

      await spec.done()
    })
  })

  incubator.sequence('object property is mocked', (title, { save, simulate }) => {
    test(title, async () => {
      const spy = await save({ a: { do() { return 1 } } })

      expect(spy.a.do()).toBe(1)

      await save.done()

      const stub = await simulate({ a: { do() { throw new Error('should not reach') } } })

      expect(stub.a.do()).toBe(1)

      await simulate.done()
    })
  })

  incubator('callback method success', (title, spec) => {
    test(title, async () => {
      const subject = await spec({
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

  incubator('same child in two properties', (title, spec) => {
    test(title, async () => {
      const child = { a: 1 }
      const subject = { x: child, y: child }
      const s = await spec(subject)
      expect(s.x.a).toBe(1)
      expect(s.y.a).toBe(1)

      s.x.a = 2
      expect(s.y.a).toBe(2)
      await spec.done()
    })
  })

  incubator('circular child properties', (title, spec) => {
    test(title, async () => {
      const subject: any = { a: 1 }
      subject.s = subject

      const s = await spec(subject)
      expect(s.a).toBe(1)
      expect(s.s.a).toBe(1)
      expect(s.s.s.a).toBe(1)

      s.a = 2
      expect(s.s.a).toBe(2)
      await spec.done()
    })
  })

  // version 8
  incubator('modify out array param', (title, spec) => {
    test.skip(title, async () => {
      const s = await spec({
        getArray() { return ['a', 'b'] },
        updateArray(arr: string[]) {
          arr[1] = 'c'
        }
      })

      const arr = s.getArray()
      s.updateArray(arr)
      expect(arr).toEqual(['a', 'c'])
      await spec.done()
    })
  })

  // version 8
  incubator.sequence('method skips internal method calls', (title, { save, simulate }) => {
    test.skip(title, async () => {
      const spy = await save({
        foo() {
          this.internalCall()
          return 'ok'
        },
        internalCall() { }
      })
      expect(spy.foo()).toBe('ok')
      await save.done()
      const stub = await simulate({
        foo() {
          this.internalCall()
          return 'ok'
        },
        internalCall() { throw new Error('should not reach') }
      })
      expect(stub.foo()).toBe('ok')
      await simulate.done()
    })
  })
})

describe('function', () => {
  incubator('no input no result', (title, spec) => {
    test(title, async () => {
      const subject = await spec(() => { })
      expect(subject()).toBeUndefined()

      await spec.done()
    })
  })
  incubator('string input no result', (title, spec) => {
    test(title, async () => {
      const subject = await spec((_x: string) => { })
      expect(subject('abc')).toBeUndefined()

      await spec.done()
    })
  })
  incubator('string input returns same string', (title, spec) => {
    test(title, async () => {
      const subject = await spec((x: string) => x)
      expect(subject('abc')).toEqual('abc')

      await spec.done()
    })
  })
  incubator('no input, string result', (title, spec) => {
    test(title, async () => {
      const subject = await spec(() => 'abc')
      const actual = subject()
      expect(actual).toBe('abc')

      await spec.done()
    })
  })
  incubator('undefined input, undefined result', (title, spec) => {
    test(title, async () => {
      const subject = await spec((_a: any, _b: any) => undefined)
      const actual = subject(undefined, undefined)
      expect(actual).toBe(undefined)
      await spec.done()
    })
  })
  incubator('primitive inputs, simple result', (title, spec) => {
    test(title, async () => {
      const subject = await spec((x: number, y: number) => x + y)
      const actual = subject(1, 2)

      expect(actual).toBe(3)

      await spec.done()
    })
  })
  incubator('no input, array output', (title, spec) => {
    test(title, async () => {
      const subject = await spec(() => [1, 2, 'c'])
      const actual = subject()
      expect(actual).toEqual([1, 2, 'c'])

      await spec.done()
    })
  })
  incubator('empty array inputs', (title, spec) => {
    test(title, async () => {
      const subject = await spec(function takeArray(name: string, args: string[]) { return { name, args } })
      const actual = subject('node', [])

      a.satisfies(actual, { name: 'node', args: [] })
      await spec.done()
    })
  })
  incubator('array inputs', (title, spec) => {
    test(title, async () => {
      const subject = await spec(function takeArray(name: string, args: string[]) { return { name, args } })
      const actual = subject('node', ['--version'])

      a.satisfies(actual, { name: 'node', args: ['--version'] })
      await spec.done()
    })
  })
  incubator('insert value to input array', (title, spec) => {
    test(title, async () => {
      const subject = await spec(function passthroughArray(value: string[]) {
        value.push('c')
        return value
      })
      const actual = subject(['a', 'b'])
      expect(actual).toEqual(['a', 'b', 'c'])
      await spec.done()
    })
  })
  incubator('update value in input array', (title, spec) => {
    test(title, async () => {
      const subject = await spec(function passthroughArray(value: string[]) {
        value[1] = 'c'
        return value
      })
      const actual = subject(['a', 'b'])
      expect(actual).toEqual(['a', 'c'])
      await spec.done()
    })
  })
  // version 8
  incubator('update value in output array', (title, spec) => {
    test.skip(title, async () => {
      const subject = await spec(() => {
        return {
          get() { return [1, 2, 3] },
          modify(array: number[]) {
            array[0] = 4
          }
        }
      })
      const s = subject()
      const value = s.get()
      expect(value).toEqual([1, 2, 3])
      s.modify(value)
      expect(value).toEqual([4, 2, 3])
      await spec.done()
    })
  })
  incubator('expend array by assignment', (title, spec) => {
    test(title, async () => {
      const subject = await spec(function passthroughArray(value: string[]) {
        value[2] = 'c'
        return value
      })
      const actual = subject(['a', 'b'])
      expect(actual).toEqual(['a', 'b', 'c'])
      await spec.done()
    })
  })
  incubator('throwing error', (title, spec) => {
    test(title, async () => {
      const subject = await spec(() => { throw new Error('failed') })
      const err = a.throws(() => subject())

      expect(err.message).toBe('failed')

      await spec.done()
    })
  })
  incubator('throwing custom error', (title, spec) => {
    test(title, async () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message)

          Object.setPrototypeOf(this, new.target.prototype)
        }
        x = 'x'
        one = 1
      }
      const subject = await spec(() => { throw new CustomError('failed') })
      const err = a.throws<CustomError>(() => subject())

      expect(err.message).toBe('failed')
      expect(err.x).toBe('x')
      expect(err.one).toBe(1)
      await spec.done()
    })
  })
  incubator('immediate invoke callback', (title, spec) => {
    test(title, async () => {
      const subject = await spec(simpleCallback.success)
      let actual
      subject(2, (_, result) => {
        actual = result
      })

      expect(actual).toBe(3)

      await spec.done()
    })
  })

  function echo(value: any, callback: (v: any) => void) {
    callback(value)
  }

  incubator('callback receiving undefined', (title, spec) => {
    test(title, async () => {
      const subject = await spec(echo)
      let actual: any
      subject(undefined, v => actual = v)

      expect(actual).toBeUndefined()
      await spec.done()
    })
  })

  incubator('callback receiving null', (title, spec) => {
    test(title, async () => {
      const subject = await spec(echo)
      let actual: any
      subject(null, v => actual = v)

      expect(actual).toBeNull()
      await spec.done()
    })
  })
  incubator('immediate invoke throwing callback', (title, spec) => {
    test(title, async () => {
      const subject = await spec(simpleCallback.fail)

      const err = await a.throws(simpleCallback.increment(subject, 2))

      expect(err.message).toBe('fail')

      await spec.done()
    })
  })
  incubator('simple callback invoked multiple times', (title, spec) => {
    test(title, async () => {
      const subject = await spec(simpleCallback.success)

      expect(await simpleCallback.increment(subject, 2)).toBe(3)
      expect(await simpleCallback.increment(subject, 4)).toBe(5)

      await spec.done()
    })
  })
  incubator('delayed callback invocation', (title, spec) => {
    test(title, async () => {
      const subject = await spec(delayed.success)

      expect(await delayed.increment(subject, 2)).toBe(3)
      expect(await delayed.increment(subject, 4)).toBe(5)

      await spec.done()
    })
  })
  incubator('callback in object literal success', (title, spec) => {
    test(title, async () => {
      const subject = await spec(callbackInObjLiteral.success)

      expect(await callbackInObjLiteral.increment(subject, 2)).toBe(3)

      await spec.done()
    })
  })
  incubator('callback in object literal fail', (title, spec) => {
    test(title, async () => {
      const subject = await spec(callbackInObjLiteral.fail)

      const err = await a.throws(callbackInObjLiteral.increment(subject, 2), Error)

      expect(err.message).toBe('fail')

      await spec.done()
    })
  })
  incubator('callback in deep object literal success', (title, spec) => {
    test(title, async () => {
      const subject = await spec(callbackInDeepObjLiteral.success)

      expect(await callbackInDeepObjLiteral.increment(subject, 2)).toBe(3)
      expect(await callbackInDeepObjLiteral.increment(subject, 4)).toBe(5)

      await spec.done()
    })
  })
  incubator('callback in deep object literal fail', (title, spec) => {
    test(title, async () => {
      const subject = await spec(callbackInDeepObjLiteral.fail)

      await a.throws(callbackInDeepObjLiteral.increment(subject, 2), err => err.message === 'fail')

      await spec.done()
    })
  })
  incubator('synchronous callback success', (title, spec) => {
    test(title, async () => {
      const subject = await spec(synchronous.success)

      expect(synchronous.increment(subject, 3)).toBe(4)

      await spec.done()
    })
  })
  incubator('synchronous callback throws', (title, spec) => {
    test(title, async () => {
      const subject = await spec(synchronous.fail)

      const err = a.throws(() => synchronous.increment(subject, 3))

      expect(err.message).toBe('fail')

      await spec.done()
    })
  })
  incubator('recursive two calls success', (title, spec) => {
    test(title, async () => {
      const subject = await spec(recursive.success)

      const actual = await recursive.decrementToZero(subject, 2)

      expect(actual).toBe(0)

      await spec.done()
    })
  })
  incubator('invoke callback after returns', (title, spec) => {
    test(title, async () => {
      const subject = await spec(postReturn.fireEvent)

      await new Promise<void>(a => {
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
  incubator('invoke fetch style: with options and callback', (title, spec) => {
    test(title, async () => {
      const subject = await spec(fetch.success)
      const actual = await fetch.add(subject, 1, 2)
      expect(actual).toBe(3)
      await spec.done()
    })
  })
  incubator('invoke fetch style: receive error in callback', (title, spec) => {
    test(title, async () => {
      const subject = await spec(fetch.fail)
      const actual = await a.throws(fetch.add(subject, 1, 2))
      expect(actual).toEqual({ message: 'fail' })
      await spec.done()
    })
  })
  incubator('function with array arguments', (title, spec) => {
    test(title, async () => {
      const subject = await spec(function takeArray(name: string, args: string[]) { return { name, args } })
      const actual = subject('node', ['--version'])

      expect(actual.name).toBe('node')
      expect(actual.args).toEqual(['--version'])

      await spec.done()
    })
  })
  incubator('function with static prop', (title, spec) => {
    test(title, async () => {
      const fn = Object.assign(function () { }, { a: 1 })

      const mock = await spec(fn)
      expect(mock.a).toBe(1)

      await spec.done()
    })
  })
  incubator('return out of scope value', (title, spec) => {
    function scopingSpec(expected: number) {
      return spec(() => expected)
    }

    test(title, async () => {
      await scopingSpec(1).then(subject => expect(subject()).toBe(1))
      await scopingSpec(3).then(subject => expect(subject()).toBe(3))
      await spec.done()
    })
  })
  incubator('invoke method of input', (title, spec) => {
    test(title, async () => {
      expect.assertions(1)
      const emitter = new EventEmitter()
      emitter.on('abc', () => expect(true).toBe(true))
      const s = await spec(({ emitter }: { emitter: EventEmitter }) => emitter.emit('abc'))
      s({ emitter })
      await spec.done()
    })
  })
  incubator('call toString()', (title, spec) => {
    test(title, async () => {
      const subject = await spec(function () { })
      expect(subject.toString()).toEqual('function () { [native code] }')

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
    doSomething(remote: AnyFunction) {
      return remote()
    },
    success() {
      return Promise.resolve()
    }
  }

  incubator('resolve with no value', (title, spec) => {
    test(title, async () => {
      const subject = await spec(noReturn.success)
      await noReturn.doSomething(subject).then((v: any) => {
        expect(v).toBeUndefined()
        return spec.done()
      })
    })
  })

  incubator('resolve with value', (title, spec) => {
    test(title, async () => {
      const subject = await spec(promise.success)
      // not using `await` to make sure the return value is a promise.
      // `await` will hide the error if the return value is not a promise.
      return promise.increment(subject, 2)
        .then((actual: number) => {
          expect(actual).toBe(3)
          return spec.done()
        })
    })
  })

  incubator('reject with error', (title, spec) => {
    test(title, async () => {
      const subject = await spec(promise.fail)
      return promise.increment(subject, 2)
        .then(() => { throw new Error('should not reach') })
        .catch(async (e: Error) => {
          expect(e.message).toBe('expected error')
          await spec.done()
        })
    })
  })

  incubator('promise with callback in between', (title, spec) => {
    test(title, async () => {
      function foo(x: number, cb: AnyFunction) {
        return new Promise(a => {
          setTimeout(() => {
            cb('called')
            a(x + 1)
          }, 10)
        })
      }
      const subject = await spec(foo)

      let fooing: any
      return new Promise<void>(a => {
        fooing = subject(2, (msg: string) => {
          expect(msg).toBe('called')
          a()
        })
      }).then(() => fooing)
        .then(actual => {
          expect(actual).toBe(3)
          return spec.done()
        })
    })
  })

  incubator('promise resolves to function', (title, spec) => {
    test(title, async () => {
      const subject = await spec(promiseChain.success)
      // not using `await` to make sure the return value is a promise.
      // `await` will hide the error if the return value is not a promise.
      return promise.increment(subject, 2)
        .then(async (actualFn: AnyFunction) => {
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

  incubator('invoke declared method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(Foo)
      const instance = new Subject(1)
      expect(instance.getValue()).toBe(1)
      await spec.done()
    })
  })

  incubator('invoke sub-class method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(Boo)

      const instance = new Subject(1)
      expect(instance.getPlusOne()).toBe(2)
      await spec.done()
    })
  })

  incubator('invoke parent method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(Boo)

      const instance = new Subject(1)
      expect(instance.getValue()).toBe(1)
      await spec.done()
    })
  })

  incubator('create multiple instances of the same class', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(Foo)
      const f1 = new Subject(1)
      const f2 = new Subject(2)
      expect(f1.getValue()).toBe(1)
      expect(f2.getValue()).toBe(2)
      await spec.done()
    })
  })

  incubator.sequence('ok to use super/sub-class as long as behavior is the same', (title, specs) => {
    // It is ok to use diff
    test(title, async () => {
      const save = specs.save
      const bs = await save(Boo)
      const boo = new bs(2)
      expect(boo.getValue()).toBe(2)
      await save.done()

      const sim = specs.simulate
      const fs = await sim(Foo)
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
  incubator('class method with callback', (title, spec) => {
    test(title, async () => {
      const s = await spec(WithCallback)
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

  incubator('invoke method throws', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(Throwing)
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
  incubator('method return resolved promise', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(ResolvedPromise)
      const p = new Subject()
      expect(await p.increment(3)).toBe(4)

      await spec.done()
    })
  })

  incubator('method returns delayed promise', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(DelayedPromise)
      const p = new Subject()
      expect(await p.increment(3)).toBe(4)

      await spec.done()
    })
  })

  incubator('invoke method returns delayed promise multiple times', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(DelayedPromise)
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

  incubator('method invokes internal method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(InvokeInternal)
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
  incubator('method delay invokes internal method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(DelayedInvokeInternal)
      const a = new Subject()
      expect(await a.getDelayedInner()).toBe('inner')
      expect(a.inner()).toBe('inner')

      await spec.done()
    })
  })

  incubator.sequence('actual method is not invoked during simulation', (title, { save, simulate }) => {
    test(title, async () => {
      const Subject = await save(DelayedInvokeInternal)
      const dii = new Subject()

      expect(await dii.getDelayedInner()).toBe('inner')
      await save.done()
      {
        class DelayedInvokeInternal {
          getDelayedInner() {
            throw new Error('should not call')
          }
        }
        const BadSubject = await simulate(DelayedInvokeInternal)
        const bad = new BadSubject()
        expect(await bad.getDelayedInner()).toBe('inner')
        await simulate.done()
      }
    })
  })

  class RejectLeak {
    reject(x: number) {
      return new Promise((_, r) => {
        setImmediate(() => r(x))
      })
    }
  }

  incubator('runaway promise will not be leaked and break another test', (title, spec) => {
    test(`${title}: setup`, async () => {
      const MockRejector = await spec(RejectLeak)
      const e = new MockRejector()
      await a.throws(e.reject(300), v => v === 300)
      await spec.done()
    })
    test(`${title}: should not fail`, () => {
      return new Promise<void>(a => setImmediate(() => a()))
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
    exec(cmd: string, cb: AnyFunction) {
      this.channel.value = cmd
      cb(this.channel)
    }
  }

  incubator('can use class with circular reference', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(ClassWithCircular)
      const f = new Subject()

      let actual
      f.exec('echo', (channel: any) => {
        actual = channel.value
      })

      expect(actual).toBe('echo')
      await spec.done()
    })
  })

  incubator('class with circular reference accessing', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(ClassWithCircular)
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
    exec(cmd: string, cb: AnyFunction) {
      cb(this.channel)
      this.channel.stdio.emit(cmd)
    }
  }

  // TODO: throws NotSupported error for callback with complex object.
  // This gives indication to the user that a plugin is need to support this subject
  // To fix this, I need to:
  // 1. get property key and value from object without invoking getter.
  // 2. Add GetAction SetAction back
  incubator('callback with complex object', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(Ssh)
      const f = new Subject()

      let actual
      f.exec('echo', (channel: any) => channel.stdio.on((data: any) => actual = data))

      expect(actual).toBe('echo')
      await spec.done()
    })
  })

  incubator('use composite callback function', (title, spec) => {
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
      const s = await spec(Foo)
      const f = new s()
      const actual = f.on(fn)

      expect(actual.value).toBe('xyz')

      await spec.done()
    })
  })

  incubator('class with property', (title, spec) => {
    test(title, async () => {
      const s = await spec(WithProperty)
      const p = new s()
      expect(p.do(2)).toBe(2)
      expect(p.y).toBe(1)
      p.y = 3
      expect(p.y).toBe(3)
      await spec.done()
    })
  })

  incubator('static property', (title, spec) => {
    test(title, async () => {
      const s = await spec(WithStaticProp)
      expect(s.x).toBe(1)
      expect(s.x = 3).toBe(3)
      await spec.done()
    })
  })

  incubator('static method', (title, spec) => {
    test(title, async () => {
      const s = await spec(WithStaticMethod)
      expect(s.do()).toBe('foo')
      await spec.done()
    })
  })
})

describe('instance', () => {
  incubator('passes instanceof test for 1st level class', (title, spec) => {
    test(title, async () => {
      const S = await spec(Dummy)
      const s = new S()
      expect(s).toBeInstanceOf(Dummy)
      await spec.done()
    })
  })

  incubator('passes instanceof test for sub class', (title, spec) => {
    test(title, async () => {
      const S = await spec(ChildOfDummy)
      const s = new S()
      expect(s).toBeInstanceOf(ChildOfDummy)
      expect(s).toBeInstanceOf(Dummy)
      await spec.done()
    })
  })

  incubator('instanceof for output instance is not supported (need custom plugin for this)', (title, spec) => {
    test.skip(title, async () => {
      function fool() {
        return new ChildOfDummy()
      }
      const f = await spec(fool)
      const s = f()
      expect(s).toBeInstanceOf(ChildOfDummy)
      expect(s).toBeInstanceOf(Dummy)
      await spec.done()
    })
  })

  incubator('instanceof for output instance if the class was used through input', (title, spec) => {
    test(title, async () => {
      const subject = {
        in(_: any) { return },
        out() { return new ChildOfDummy() },
      }
      const s = await spec(subject)
      s.in(new ChildOfDummy())
      const actual = s.out()
      expect(actual).toBeInstanceOf(ChildOfDummy)
      expect(actual).toBeInstanceOf(Dummy)
      await spec.done()
    })
  })

  incubator.sequence('getter skips internal method calls', (title, { save, simulate }) => {
    test(title, async () => {
      const spy = await save({
        get side() {
          this.internalCall()
          return 'ok'
        },
        internalCall() { }
      })
      expect(spy.side).toBe('ok')
      await save.done()

      const stub = await simulate({
        get side() {
          this.internalCall()
          return 'ok'
        },
        internalCall() { throw new Error('should not reach') }
      })
      expect(stub.side).toBe('ok')
      await simulate.done()
    })
  })

  incubator.sequence('setter skips internal method calls', (title, { save, simulate }) => {
    test(title, async () => {
      const spy = await save({
        set side(v: any) {
          this.internalCall()
        },
        internalCall() { }
      })
      spy.side = 1
      await save.done()

      const stub = await simulate({
        set side(v: any) {
          this.internalCall()
        },
        internalCall() { throw new Error('should not reach') }
      })
      stub.side = 1
      await simulate.done()
    })
  })

  incubator.sequence('method skips internal method calls', (title, { save, simulate }) => {
    test(title, async () => {
      let shouldThrow = false
      class InvokeInternal {
        foo() {
          this.internalCall()
          return 'ok'
        }
        internalCall() {
          if (shouldThrow) throw new Error('should not reach')
        }
      }
      const instance = new InvokeInternal()
      const spy = await save(instance)
      expect(spy.foo()).toBe('ok')
      await save.done()
      shouldThrow = true

      const stub = await simulate(instance)
      expect(stub.foo()).toBe('ok')
      await simulate.done()
    })
  })

  incubator('returning this is same as spy', (title, spec) => {
    test(title, async () => {
      class Fluent {
        foo() { return this }
      }

      const spy = await spec(new Fluent())
      expect(spy.foo()).toBe(spy)
      await spec.done()
    })
  })

  incubator('static property', (title, spec) => {
    test(title, async () => {
      WithStaticProp.x = 1
      function getClass() {
        return WithStaticProp
      }
      const subject = await spec(getClass)
      const s = subject()
      expect(s.x).toBe(1)
      expect(s.x = 3).toBe(3)
      await spec.done()
    })
  })

  incubator('static method', (title, spec) => {
    test(title, async () => {
      function getClass() {
        return WithStaticMethod
      }

      const subject = await spec(getClass)
      const s = subject()
      expect(s.do()).toBe('foo')
      await spec.done()
    })
  })

  incubator('constructor throws error', (title, spec) => {
    test(title, async () => {
      class Throw {
        constructor(x: string) {
          throw new Error(x)
        }
        // need this dummy method for the system to detect this is a class
        foo() { }
      }
      const s = await spec({ Throw })
      const err = a.throws(() => new s.Throw('abc'))

      expect(err.message).toBe('abc')

      await spec.done()
    })
  })

  incubator.sequence('instantiate with wrong primitive argument', (title, { save, simulate }) => {
    test(title, async () => {
      class EchoConstructorArg {
        constructor(public value: number) { }
        echo() { return this.value }
      }

      const s = await save({ EchoConstructorArg })
      new s.EchoConstructorArg(1)
      await save.done()

      const s2 = await simulate({ EchoConstructorArg })
      a.throws(() => new s2.EchoConstructorArg(2), ActionMismatch)
    })
  })

  incubator.sequence('instantiate with different argument is okay as long as behavior does not change', (title, { save, simulate }) => {
    test(title, async () => {
      class EchoConstructorArg {
        constructor(public value: string) { }
        echo() { return this.value }
      }

      const s = await save({ EchoConstructorArg })
      new s.EchoConstructorArg('abc')
      await save.done()

      const s2 = await simulate({ EchoConstructorArg })
      new s2.EchoConstructorArg('xyz')
      await simulate.done()
    })
  })

  incubator('ioc instantiate class', (title, spec) => {
    test(title, async () => {
      class Dummy { foo() { } }
      const s = await spec((subject: any) => new subject())
      expect(s(Dummy)).toBeInstanceOf(Dummy)

      await spec.done()
    })
  })
})

describe('ignoreMismatch', () => {
  incubator.save('call after spec throws', (title, spec) => {
    test(title, async () => {
      await spec({})
      a.throws(() => spec.ignoreMismatch(1), InvokeMetaMethodAfterSpec)
    })
  })
  incubator.sequence('reference object changes are ignored by default. Garbage-in garbage-out issues are handled by tests, not by the system', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = (x: string) => x
      const s = await save(subject)
      expect(s('192.168.0.123')).toBe('192.168.0.123')
      await save.done()

      const s2 = await simulate(subject)
      expect(s2('10.0.8.123')).toBe('10.0.8.123')
      await simulate.done()
    })
  })
  incubator('non-primitive value are skipped (still work as normal)', (title, spec) => {
    test(title, async () => {
      spec.ignoreMismatch('192.168.0.123')
      const s = await spec((x: string) => x)
      const actual = s('192.168.0.123')
      expect(actual).toBe('192.168.0.123')
      await spec.done()
    })
  })
  incubator.sequence('on get', (title, { save, simulate }) => {
    test(title, async () => {
      save.ignoreMismatch(1)
      const spy = await save({ a: 1 })
      expect(spy.a).toBe(1)
      await save.done()

      const stub = await simulate({ a: 2 })
      expect(stub.a).toBe(1) // still get the saved value
      await simulate.done()
    })
  })
  incubator.sequence('on set', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = { a: 1 }
      save.ignoreMismatch(2)
      const spy = await save(subject)
      spy.a = 2
      expect(spy.a).toBe(2)
      await save.done()

      const stub = await simulate(subject)
      stub.a = 3
      expect(stub.a).toBe(2) // still get the saved value
      await simulate.done()
    })
  })
  incubator.sequence('in invoke param', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = (x: number) => x + 1
      save.ignoreMismatch(1)
      const spy = await save(subject)
      const actual = spy(1)
      expect(actual).toBe(2)
      await save.done()

      const stub = await simulate(subject)
      const actual2 = stub(100)
      expect(actual2).toBe(2) // still get the saved value
      await simulate.done()
    })
  })
  incubator.sequence('in invoke param array', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = (x: number[]) => x[1]
      save.ignoreMismatch(1)
      const spy = await save(subject)
      const actual = spy([2, 1])
      expect(actual).toBe(1)
      await save.done()

      const stub = await simulate(subject)
      const actual2 = stub([2, 100])
      expect(actual2).toBe(1) // still get the saved value
      await simulate.done()
    })
  })
  incubator.sequence('in instantiate param', (title, { save, simulate }) => {
    test(title, async () => {
      class Subject {
        constructor(private value: number) { }
        getValue() {
          return this.value
        }
      }
      save.ignoreMismatch(1)
      const spy = await save(Subject)
      const actual = new spy(1)
      expect(actual.getValue()).toBe(1)
      await save.done()

      const stub = await simulate(Subject)
      const actual2 = new stub(100)
      expect(actual2.getValue()).toBe(1) // still get the saved value
      await simulate.done()
    })
  })
})

describe('maskValue', () => {
  incubator.save('actual value is sent to the subject', (title, spec) => {
    test(title, async () => {
      spec.maskValue('secret')
      const s = await spec((value: string) => expect(value).toBe('secret'))
      s('secret')
      await spec.done()
    })
  })

  incubator.save('call after spec throws', (title, spec) => {
    test(title, async () => {
      await spec(() => { })
      a.throws(() => spec.maskValue('secret'), InvokeMetaMethodAfterSpec)
    })
  })

  incubator('not save in log', (title, spec, reporter) => {
    test(title, async () => {
      spec.enableLog()
      spec.maskValue('secret')
      const s = await spec((v: string) => v)
      s('secret')
      await spec.done()
      expect(JSON.stringify(reporter.logs)).not.toMatch('secret')
    })
  })

  incubator('invoke returns masked value', (title, spec) => {
    test(title, async () => {
      spec.maskValue('secret')
      const s = await spec((v: string) => v)
      const actual = s('secret')
      expect(actual).toBe('******')
      await spec.done()
    })
  })

  incubator('get returns masked value', (title, spec) => {
    test(title, async () => {
      spec.maskValue('secret')
      const s = await spec({ secret: 'secret' })
      expect(s.secret).toBe('******')
      await spec.done()
    })
  })

  incubator('against array', (title, spec) => {
    test(title, async () => {
      spec.maskValue('secret')
      const s = await spec((v: string) => [v, 'world'])
      expect(s('secret')).toEqual(['******', 'world'])
      await spec.done()
    })
  })

  incubator('against object', (title, spec) => {
    test(title, async () => {
      spec.maskValue('secret')
      const s = await spec((value: string) => { return { value, b: 1 } })
      expect(s('secret')).toEqual({ value: '******', b: 1 })
      await spec.done()
    })
  })

  describe('with string', () => {
    incubator('replace with different string', (title, spec) => {
      test(title, async () => {
        spec.maskValue('secret', 'apple')
        const s = await spec({ secret: 'secret' })
        expect(s.secret).toBe('apple')
        await spec.done()
      })
    })

    incubator('replace with callback', (title, spec) => {
      test(title, async () => {
        spec.maskValue('secret', () => 'apple')
        const s = await spec({ secret: 'secret' })
        expect(s.secret).toBe('apple')
        await spec.done()
      })
    })
  })

  describe('with regex', () => {
    incubator('using default replaceWith', (title, spec) => {
      test(title, async () => {
        spec.maskValue(/secret/)
        const s = await spec((v: string) => v)
        expect(s('some secret message')).toBe('some ****** message')
        await spec.done()
      })
    })

    incubator('does not apply to numbers', (title, spec) => {
      test(title, async () => {
        spec.maskValue(/1234/)
        const s = await spec((v: number) => v)
        expect(s(1234)).toBe(1234)
        await spec.done()
      })
    })

    incubator('replace with string', (title, spec) => {
      test(title, async () => {
        spec.maskValue(/secret/, 'miku')
        const s = await spec((v: string) => v)
        expect(s('some secret message')).toBe('some miku message')
        await spec.done()
      })
    })

    incubator('replace with callback', (title, spec) => {
      test(title, async () => {
        spec.maskValue(/secret/, () => 'miku strike')
        const s = await spec((v: string) => v)
        expect(s('some secret message')).toBe('miku strike')
        await spec.done()
      })
    })
  })

  describe('with number', () => {
    incubator('using default replaceWith', (title, spec) => {
      test(title, async () => {
        spec.maskValue(3)
        spec.maskValue(1234)
        const s = await spec((v: number) => v + 1)
        expect(s(1)).toBe(2)
        expect(s(2)).toBe(7)
        expect(s(1233)).toBe(7777)
        await spec.done()
      })
    })

    incubator('replace with number', (title, spec) => {
      test(title, async () => {
        spec.maskValue(3, 1234)
        const s = await spec((v: number) => v + 1)
        expect(s(2)).toBe(1234)
        await spec.done()
      })
    })

    incubator('replace with callback', (title, spec) => {
      test(title, async () => {
        spec.maskValue(3, () => 1234)
        const s = await spec((v: number) => v + 1)
        expect(s(2)).toBe(1234)
        await spec.done()
      })
    })
  })

  describe('with predicate', () => {
    incubator('using default replaceWith for number', (title, spec) => {
      test(title, async () => {
        spec.maskValue((v: number) => v > 100)
        const s = await spec((v: number) => v + 1)
        expect(s(100)).toBe(777)
        await spec.done()
      })
    })

    incubator('using default replaceWith for string', (title, spec) => {
      test(title, async () => {
        spec.maskValue((v: string) => v === 'secret')
        const s = await spec((v: string) => v)
        expect(s('secret')).toBe('******')
        await spec.done()
      })
    })

    incubator('replace with number', (title, spec) => {
      test(title, async () => {
        spec.maskValue((v: number) => v > 100, 999)
        const s = await spec((v: number) => v + 1)
        expect(s(100)).toBe(999)
        await spec.done()
      })
    })

    incubator('replace with string', (title, spec) => {
      test(title, async () => {
        spec.maskValue((v: string) => v === 'abcd', '*.*')
        const s = await spec((v: string) => v)
        expect(s('abcd')).toBe('*.*')
        await spec.done()
      })
    })

    incubator('replace with callback', (title, spec) => {
      test(title, async () => {
        spec.maskValue((v: string) => v === 'abcd', () => '*.*')
        const s = await spec((v: string) => v)
        expect(s('abcd')).toBe('*.*')
        await spec.done()
      })
    })
  })
})
