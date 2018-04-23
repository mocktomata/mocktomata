import t from 'assert'
import a from 'assertron'
import { setTimeout } from 'timers'

import k from '../testUtil'
import {
  spec,
  functionConstructed,
  functionInvoked,
  promiseConstructed,
  promiseResolved,
  promiseRejected,
  functionReturned
} from '..'

const promise = {
  increment(remote, x) {
    return remote('increment', x)
  },
  success(_url, x) {
    return Promise.resolve(x + 1)
  },
  fail() {
    return Promise.reject(new Error('fail'))
  }
}

const promiseChain = {
  increment(remote, x) {
    return remote('increment', x)
  },
  success(_url, x) {
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
  doSomething(remote) {
    return remote()
  },
  success() {
    return Promise.resolve()
  }
}

function resolving(x) {
  return Promise.resolve(x)
}

function rejecting(y) {
  return Promise.reject(y)
}

test('acceptance', async () => {
  const res = await spec(resolving)
  await res.subject(1)

  await res.satisfy([
    functionConstructed(),
    functionInvoked(),
    functionReturned(),
    promiseConstructed(),
    promiseResolved(1)
  ])

  const rej = await spec(rejecting)
  await a.throws(rej.subject(2))
  await rej.satisfy([
    functionConstructed(),
    functionInvoked(),
    functionReturned(),
    promiseConstructed(),
    promiseRejected(2)
  ])
})

k.trio('promise/noReturn', (title, spec) => {
  test(title, async () => {
    const s = await spec(noReturn.success)
    return noReturn.doSomething(s.subject)
      .then(() => {
        return s.satisfy([
          { ...functionConstructed({ functionName: 'success' }), instanceId: 1 },
          { ...functionInvoked(), instanceId: 1, invokeId: 1 },
          { ...functionReturned(), instanceId: 1, invokeId: 1, returnType: 'promise', returnInstanceId: 1 },
          { ...promiseConstructed(), instanceId: 1 },
          { ...promiseResolved(), instanceId: 1, invokeId: 1 }
        ])
      })
  })
})

k.trio('promise/resolve', (title, spec) => {
  test(title, async () => {
    const s = await spec(promise.success)
    // not using `await` to make sure the return value is a promise.
    // `await` will hide the error if the return value is not a promise.
    return promise.increment(s.subject, 2)
      .then(actual => {
        t.equal(actual, 3)
        return s.satisfy([
          { ...functionConstructed({ functionName: 'success' }), instanceId: 1 },
          { ...functionInvoked('increment', 2), instanceId: 1, invokeId: 1 },
          { ...functionReturned(), instanceId: 1, invokeId: 1, returnType: 'promise', returnInstanceId: 1 },
          { ...promiseConstructed(), instanceId: 1 },
          { ...promiseResolved(3), instanceId: 1, invokeId: 1 }
        ])
      })
  })
})

k.trio('promise/reject', (title, spec) => {
  test(title, async () => {
    const s = await spec(promise.fail)
    return promise.increment(s.subject, 2)
      .then(() => t.fail('should not reach'))
      .catch(() => {
        return s.satisfy([
          { ...functionConstructed({ functionName: 'fail' }), instanceId: 1 },
          { ...functionInvoked('increment', 2), instanceId: 1, invokeId: 1 },
          { ...functionReturned(), instanceId: 1, invokeId: 1, returnType: 'promise', returnInstanceId: 1 },
          { ...promiseConstructed(), instanceId: 1 },
          { ...promiseRejected({ message: 'fail' }), instanceId: 1, invokeId: 1 }
        ])
      })
  })
})

k.trio('promise with callback in between', 'promise/inBetween', (title, spec) => {
  test(title, async () => {
    function foo(x, cb) {
      return new Promise(a => {
        setTimeout(() => {
          cb('called')
          a(x + 1)
        }, 10)
      })
    }
    const s = await spec(foo);

    let fooing
    return new Promise(a => {
      fooing = s.subject(2, msg => {
        t.equal(msg, 'called')
        a()
      })
    })
      .then(() => fooing)
      .then(actual => {
        t.equal(actual, 3)
        return s.satisfy([
          { ...functionConstructed({ functionName: 'foo' }), instanceId: 1 },
          { ...functionInvoked(2), invokeId: 1, instanceId: 1 },
          { ...functionConstructed(), instanceId: 2, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourcePath: [1] },
          { ...functionReturned(), invokeId: 1, returnType: 'promise', returnInstanceId: 1, instanceId: 1 },
          { ...promiseConstructed(), instanceId: 1 },
          { ...functionInvoked('called'), instanceId: 2, invokeId: 1 },
          { ...functionReturned(), instanceId: 2, invokeId: 1 },
          { ...promiseResolved(3), invokeId: 1, instanceId: 1 }
        ])
      })
  })
})

k.trio('promise/returns/function', (title, spec) => {
  test(title, async () => {
    const s = await spec(promiseChain.success)
    // not using `await` to make sure the return value is a promise.
    // `await` will hide the error if the return value is not a promise.
    return promise.increment(s.subject, 2)
      .then(actualFn => {
        t.equal(actualFn(), 3)
        return s.satisfy([
          { ...functionConstructed({ functionName: 'success' }), instanceId: 1 },
          { ...functionInvoked('increment', 2), instanceId: 1, invokeId: 1 },
          { ...functionReturned(), instanceId: 1, invokeId: 1, returnType: 'promise', returnInstanceId: 1 },
          { ...promiseConstructed(), instanceId: 1 },
          { ...promiseResolved(), instanceId: 1, invokeId: 1, returnType: 'function', returnInstanceId: 2 },
          { ...functionConstructed(), instanceId: 2 },
          { ...functionInvoked(), instanceId: 2, invokeId: 1 },
          { ...functionReturned(3), instanceId: 2, invokeId: 1 }
        ])
      })
  })
})
