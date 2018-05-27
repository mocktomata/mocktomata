import t from 'assert'
import a from 'assertron'
import { SimulationMismatch } from 'komondor-plugin'
import { setImmediate } from 'timers'

import {
  spec,
  SpecNotFound,
  classConstructed,
  classMethodThrown,
  classMethodInvoked,
  classMethodReturned,
  promiseConstructed,
  promiseResolved,
  functionConstructed,
  functionInvoked,
  functionReturned
} from '..'
import { log } from '../log'
import k from '../testUtil'

class Foo {
  constructor(public x) { }
  getValue() {
    return this.x
  }
  doThrow() {
    throw new Error('throwing')
  }
}

class Boo extends Foo {
  getPlusOne() {
    return this.getValue() + 1
  }
}

describe('use cases', () => {
  test('acceptance test', async () => {
    const s = await spec(Foo)
    const foo = new s.subject(1)
    foo.getValue()
    t.throws(() => foo.doThrow())

    await s.satisfy([
      classConstructed('Foo', 1),
      classMethodInvoked('getValue'),
      classMethodReturned('getValue', 1),
      classMethodInvoked('doThrow'),
      classMethodThrown('doThrow', { message: 'throwing' })
    ])
  })
})


k.trio('each instance of class will get its own instanceId', 'class/multipleInstance', (title, spec) => {
  test(title, async () => {
    const s = await spec(Foo)
    const f1 = new s.subject(1)
    const f2 = new s.subject(2)
    f1.getValue()
    f2.getValue()
    await s.satisfy([
      { ...classConstructed('Foo', 1), instanceId: 1 },
      { ...classConstructed('Foo', 2), instanceId: 2 },
      { ...classMethodInvoked('getValue'), instanceId: 1, invokeId: 1 },
      { ...classMethodReturned('getValue', 1), instanceId: 1, invokeId: 1 },
      { ...classMethodInvoked('getValue'), instanceId: 2, invokeId: 1 },
      { ...classMethodReturned('getValue', 2), instanceId: 2, invokeId: 1 }
    ])
  })
})

test('simple class simulate with different constructor will throw', async () => {
  // const s = await spec.save('class/wrongConstructorCall', Boo)
  // const boo = new s.subject(2)
  // t(boo)
  // await s.done()
  const s = await spec.simulate('class/wrongConstructorCall', Foo)
  await a.throws(() => new s.subject(2), SimulationMismatch)
})


test('simulate on not existing spec will throw', async () => {
  return a.throws(spec.simulate('class/notExist', Boo), SpecNotFound)
})

k.trio('class/simple', (title, spec) => {
  test(title, async () => {
    const s = await spec(Foo)
    const foo = new s.subject(1)
    const actual = foo.getValue()
    t.equal(actual, 1)
    await s.satisfy([
      { ...classConstructed('Foo', 1), instanceId: 1 },
      { ...classMethodInvoked('getValue'), instanceId: 1, invokeId: 1 },
      { ...classMethodReturned('getValue', 1), instanceId: 1, invokeId: 1 }
    ])
  })
})

k.trio('class/extend', (title, spec) => {
  test(title, async () => {
    const s = await spec(Boo)
    const boo = new s.subject(1)
    const actual = boo.getPlusOne()

    t.equal(actual, 2)
    await s.satisfy([
      { ...classConstructed('Boo', 1), instanceId: 1 },
      { ...classMethodInvoked('getPlusOne'), instanceId: 1, invokeId: 1 },
      { ...classMethodReturned('getPlusOne', 2), instanceId: 1, invokeId: 1 }
    ])
  })
})

class WithCallback {
  callback(cb) {
    setImmediate(() => {
      cb('called')
    })
  }
  justDo(x) {
    return x
  }
}

k.trio('class/withCallback', (title, spec) => {
  test(title, async () => {
    const s = await spec(WithCallback)
    const cb = new s.subject()

    cb.justDo(1)
    await new Promise(a => {
      cb.callback(v => {
        t.equal(v, 'called')
      })
      cb.callback(v => {
        t.equal(v, 'called')
        a()
      })
    })

    await s.satisfy([
      { ...classConstructed('WithCallback'), instanceId: 1 },
      { ...classMethodInvoked('justDo', 1), instanceId: 1, invokeId: 1 },
      { ...classMethodReturned('justDo', 1), instanceId: 1, invokeId: 1 },
      { ...classMethodInvoked('callback'), instanceId: 1, invokeId: 2 },
      { ...functionConstructed(), instanceId: 1, sourceType: 'class', sourceInstanceId: 1, sourceInvokeId: 2, sourceSite: [0] },
      { ...classMethodReturned('callback'), instanceId: 1, invokeId: 2 },
      { ...classMethodInvoked('callback'), instanceId: 1, invokeId: 3 },
      { ...functionConstructed(), instanceId: 2, sourceType: 'class', sourceInstanceId: 1, sourceInvokeId: 3, sourceSite: [0] },
      { ...classMethodReturned('callback'), instanceId: 1, invokeId: 3 },
      { ...functionInvoked('called'), instanceId: 1, invokeId: 1 },
      { ...functionReturned(), instanceId: 1, invokeId: 1 },
      { ...functionInvoked('called'), instanceId: 2, invokeId: 1 },
      { ...functionReturned(), instanceId: 2, invokeId: 1 }
    ])
  })
})

class WithPromise {
  increment(x) {
    return new Promise(a => {
      setImmediate(() => a(x + 1))
    })
  }
}

k.trio('method returning promise should have result of promise saved in payload',
  'class/withPromise',
  (title, spec) => {
    test(title, async () => {
      const s = await spec(WithPromise)
      const p = new s.subject()
      const actual = await p.increment(3)

      t.equal(actual, 4)
      await s.satisfy([
        { ...classConstructed('WithPromise'), instanceId: 1 },
        { ...classMethodInvoked('increment', 3), instanceId: 1, invokeId: 1 },
        { ...classMethodReturned('increment'), instanceId: 1, invokeId: 1, returnType: 'promise', returnInstanceId: 1 },
        { ...promiseConstructed(), instanceId: 1 },
        { ...promiseResolved(4), instanceId: 1, invokeId: 1 }
      ])
    })
  })

class Throwing {
  doThrow() {
    throw new Error('thrown')
  }
}

k.trio('class/throwing', (title, spec) => {
  test(title, async () => {
    const s = await spec(Throwing)
    const o = new s.subject()
    await a.throws(() => o.doThrow())

    await s.satisfy([
      { ...classConstructed('Throwing'), instanceId: 1 },
      { ...classMethodInvoked('doThrow'), instanceId: 1, invokeId: 1 },
      { ...classMethodThrown('doThrow', { message: 'thrown' }), instanceId: 1, invokeId: 1 }
    ])
  })
})

class Promising {
  do(x) {
    return new Promise(a => {
      setImmediate(() => a(x))
    })
  }
}

k.trio('async promise call', 'class/promising', (title, spec) => {
  test(title, async () => {
    const s = await spec(Promising)
    // s.onAny(a => {
    //   log.warn(`${a.type} ${a.name} ${a.instanceId} ${a.invokeId || ''}`)
    // })
    const p = new s.subject()

    const calls = [1, 2].map(x => p.do(x))
    await Promise.all(calls)
    await p.do(3)

    await s.done()
  })
})

class InvokeInternal {
  do() {
    return this.internal()
  }
  internal() {
    return 'do'
  }
}

k.trio('internal method invocation will not be recorded', 'class/internal', (title, spec) => {
  test(title, async () => {
    const s = await spec(InvokeInternal)
    const a = new s.subject()
    t.equal(a.do(), 'do')

    await s.satisfy([
      { ...classConstructed('InvokeInternal'), instanceId: 1 },
      { ...classMethodInvoked('do'), instanceId: 1, invokeId: 1 },
      { ...classMethodReturned('do'), instanceId: 1, invokeId: 1 }
    ])
  })
})

k.trio('capture parent class call', 'class/parentCall', (title, spec) => {
  test(title, async () => {
    class Parent { do() { return 'do' } }
    class Child extends Parent { }
    const s = await spec(Child)
    const a = new s.subject()
    t.equal(a.do(), 'do')

    await s.satisfy([
      { ...classConstructed('Child'), instanceId: 1 },
      { ...classMethodInvoked('do'), instanceId: 1, invokeId: 1 },
      { ...classMethodReturned('do'), instanceId: 1, invokeId: 1 }
    ])
  })
})

k.trio('should not record inner call when using Promise', 'class/promisWithInner', (title, spec) => {
  test(title, async () => {
    class PromiseInner {
      do() {
        return new Promise(a => {
          setImmediate(() => {
            a(this.inner())
          })
        })
      }
      inner() {
        return 'inner'
      }
    }
    const s = await spec(PromiseInner)
    const a = new s.subject()
    t.equal(await a.do(), 'inner')

    t.equal(s.actions.length, 5)
    await s.satisfy([
      { ...classConstructed('PromiseInner'), instanceId: 1 },
      { ...classMethodInvoked('do'), instanceId: 1, invokeId: 1 },
      { ...classMethodReturned('do'), instanceId: 1, invokeId: 1 }
    ])
  })
})

test('promise should not invoke actual code', async () => {
  class PromiseInner {
    do() {
      throw new Error('should not call')
      // return new Promise(a => {
      //   setImmediate(() => {
      //     a(this.inner() as any)
      //   })
      // })
    }
    inner() {
      return 'inner'
    }
  }
  const s = await spec.simulate('class/simulateNotInvokeInner', PromiseInner)
  const a = new s.subject()
  // tslint:disable-next-line
  t.equal(await a.do(), 'inner')

  t.equal(s.actions.length, 5)
  await s.satisfy([
    { ...classConstructed('PromiseInner'), instanceId: 1 },
    { ...classMethodInvoked('do'), instanceId: 1, invokeId: 1 },
    { ...classMethodReturned('do'), instanceId: 1, invokeId: 1 }
  ])
})

k.trio('not using spec', 'class/notUsedSpec', (title, spec) => {
  test(title, async () => {
    class Foo { foo() { return 'foo' } }
    function call(_foo) {
      return 'called'
    }
    const s = await spec(Foo)
    const foo = new s.subject()
    t.equal(call(foo), 'called')

    await s.satisfy([
      { ...classConstructed('Foo'), instanceId: 1 }
    ])
  })
})

class Echo {
  echo(x) {
    return new Promise((_, r) => {
      setImmediate(() => r(x))
      // setTimeout(() => {
      //   if (x > 200) {
      //     r(x)
      //   }
      //   else {
      //     a(x)
      //   }
      // }, x)
    })
  }
}

describe('prevent runaway promise', () => {
  test('setup runaway', async () => {
    const s = await spec(Echo)
    const e = new s.subject()
    return a.throws(e.echo(300), v => v === 300)
  })
  test('no runaway promise to break this test', () => {
    return new Promise(a => setImmediate(() => a()))
  })
})

class WithCircular {
  value: any
  cirRef
  constructor() {
    this.cirRef = this
  }
}

class ClassWithCircular {
  channel: WithCircular
  constructor() {
    this.channel = new WithCircular()
  }
  exec(cmd, cb) {
    this.channel.value = cmd
    cb(this.channel)
  }
}

k.trio('class with circular reference', 'class/circular', (title, spec) => {
  test(title, async () => {
    const s = await spec(ClassWithCircular)
    const f = new s.subject()

    let actual
    f.exec('echo', data => {
      actual = data.value
    })

    t.equal(actual, 'echo')
    await s.done()
  })
})

k.trio('class with circular reference accessing', 'class/circularAccess', (title, spec) => {
  test(title, async () => {
    const s = await spec(ClassWithCircular)
    const f = new s.subject()

    let actual
    f.exec('echo', data => {
      actual = data.cirRef.value
    })

    t.equal(actual, 'echo')
    await s.done()
  })
})

class Channel {
  listeners: any[] = []
  stdio
  constructor() {
    this.stdio = this
  }
  on(listener) {
    this.listeners.push(listener)
  }
  emit(data) {
    this.listeners.forEach(l => l(data))
  }
}

class Ssh {
  channel: Channel
  constructor() {
    this.channel = new Channel()
  }
  exec(cmd, cb) {
    cb(this.channel)
    this.channel.stdio.emit(cmd)
  }
}

// TODO: throws NotSupported error for callback with complex object.
// This gives indication to the user that a plugin is need to support this subject
k.trio('callback with', 'class/callbackWithComplexObject', (title, spec) => {
  test.skip(title, async () => {
    const s = await spec(Ssh)
    const f = new s.subject()

    let actual
    f.exec('echo', channel => {
      // can't create channel with stdio.on() from data
      // unless start doing new Function(...)
      channel.stdio.on(data => actual = data)
    })

    t.equal(actual, 'echo')
    await s.done()
  })
})

k.trio('class/callbackWithComposite', (title, spec) => {
  test(title, async () => {
    class Foo {
      on(compositeFn) {
        return this.internal(compositeFn)
      }
      internal(input) {
        t.equal(input.value, 'xyz')
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
    const f = new s.subject()
    const actual = f.on(fn)
    t.equal(actual.value, 'xyz')

    await s.done()
  })
})
