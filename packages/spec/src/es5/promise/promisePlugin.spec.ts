import t from 'assert'
import a from 'assertron'
import { setTimeout } from 'timers'

import k from '../../testUtil'
import { spec } from '../..';

const promise = {
  increment(remote: any, x: number) {
    return remote('increment', x)
  },
  success(_url: string, x: number) {
    return Promise.resolve(x + 1)
  },
  fail() {
    return Promise.reject(new Error('fail'))
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
    }).then(() => Promise.reject(() => new Error('fail')))
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

function resolving(x: any) {
  return Promise.resolve(x)
}

function rejecting(y: any) {
  return Promise.reject(y)
}

test('acceptance', async () => {
  const res = await spec('promise: acceptance resolve', resolving)
  await res.subject(1)

  await res.done()

  const rej = await spec('promise: acceptance reject', rejecting)
  await a.throws(rej.subject(2))

  await rej.done()
})

k.trio('promise/noReturn', (title, spec) => {
  test(title, async () => {
    const s = await spec(noReturn.success)
    return noReturn.doSomething(s.subject)
      .then(() => {
        return s.done()
      })
  })
})

k.trio('promise/resolve', (title, spec) => {
  test(title, async () => {
    const s = await spec(promise.success)
    // not using `await` to make sure the return value is a promise.
    // `await` will hide the error if the return value is not a promise.
    return promise.increment(s.subject, 2)
      .then((actual: number) => {
        t.strictEqual(actual, 3)
        return s.done()
      })
  })
})

k.trio('promise/reject', (title, spec) => {
  test(title, async () => {
    const s = await spec(promise.fail)
    return promise.increment(s.subject, 2)
      .then(() => t.fail('should not reach'))
      .catch(() => {
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
        t.strictEqual(msg, 'called')
        a()
      })
    })
      .then(() => fooing)
      .then(actual => {
        t.strictEqual(actual, 3)
        return s.done()
      })
  })
})

k.trio('promise/returns/function', (title, spec) => {
  test(title, async () => {
    const s = await spec(promiseChain.success)
    // not using `await` to make sure the return value is a promise.
    // `await` will hide the error if the return value is not a promise.
    return promise.increment(s.subject, 2)
      .then((actualFn: Function) => {
        t.strictEqual(actualFn(), 3)
        return s.done()
      })
  })
})
