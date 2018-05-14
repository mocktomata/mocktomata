import t from 'assert'
import a from 'assertron'

import k from '../testUtil'

k.trio('instance/simpleMethod', (title, spec) => {
  test(title, async () => {
    class Foo {
      do(x) { return x + 1 }
    }
    const foo = new Foo()
    const s = await spec(foo)
    t.equal(s.subject.do(1), 2)

    await s.done()
  })
})

k.trio('instance/throw', (title, spec) => {
  test(title, async () => {
    class Foo {
      do(x) { throw new Error(x) }
    }
    const foo = new Foo()
    const s = await spec(foo)
    a.throws(() => s.subject.do(1), err => err.message === '1')

    await s.done()
  })
})


k.trio('instance/rejectPromise', (title, spec) => {
  test(title, async () => {
    class Foo {
      do(x) {
        return new Promise((_, r) => {
          setImmediate(() => r(x))
        })
      }
    }
    const foo = new Foo()
    const s = await spec(foo)
    let actual
    await s.subject.do(1).catch(a => actual = a)
    t.equal(actual, 1)

    await s.done()
  })
})

k.trio('instance/resolvePromise', (title, spec) => {
  test(title, async () => {
    class Foo {
      do(x) { return Promise.resolve(x + 1) }
    }
    const foo = new Foo()
    const s = await spec(foo)
    t.equal(await s.subject.do(1), 2)

    await s.done()
  })
})


k.trio('instance/withInner', (title, spec) => {
  test(title, async () => {
    class Foo {
      do(x) { return this.internal(x) }
      internal(x) {
        return Promise.resolve(x + 1)
      }
    }
    const foo = new Foo()
    const s = await spec(foo)
    t.equal(await s.subject.do(1), 2)
    t.equal(s.actions.length, 5)

    await s.done()
  })
})


k.trio('instance/property', (title, spec) => {
  test(title, async () => {
    class Foo {
      value = 3
    }
    const foo = new Foo()
    const s = await spec(foo)
    t.equal(s.subject.value, 3)

    await s.done()
  })
})
