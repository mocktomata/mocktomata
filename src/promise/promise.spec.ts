import t from 'assert'
import { setTimeout } from 'timers'

import { testTrio } from '../testUtil'

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

testTrio('promise/noReturn', async spec => {
  const s = await spec(noReturn.success)
  return noReturn.doSomething(s.subject)
    .then(() => {
      return s.satisfy([
        { type: 'function', name: 'invoke', meta: { instanceId: 1, invokeId: 1 } },
        { type: 'function', name: 'return', payload: {}, meta: { instanceId: 1, invokeId: 1, returnType: 'promise', returnInstanceId: 1 } },
        { type: 'promise', name: 'resolve', meta: { instanceId: 1, invokeId: 1 } }
      ])
    })
})

testTrio('promise/resolve', async spec => {
  const s = await spec(promise.success)
  // not using `await` to make sure the return value is a promise.
  // `await` will hide the error if the return value is not a promise.
  return promise.increment(s.subject, 2)
    .then(actual => {
      t.equal(actual, 3)
      return s.satisfy([
        { type: 'function', name: 'invoke', payload: ['increment', 2], meta: { instanceId: 1, invokeId: 1 } },
        { type: 'function', name: 'return', payload: {}, meta: { instanceId: 1, invokeId: 1, returnType: 'promise', returnInstanceId: 1 } },
        { type: 'promise', name: 'resolve', payload: 3, meta: { instanceId: 1, invokeId: 1 } }
      ])
    })
})

testTrio('promise/reject', async spec => {
  const s = await spec(promise.fail)
  return promise.increment(s.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return s.satisfy([
        { type: 'function', name: 'invoke', payload: ['increment', 2], meta: { instanceId: 1, invokeId: 1 } },
        { type: 'function', name: 'return', payload: {}, meta: { instanceId: 1, invokeId: 1, returnType: 'promise', returnInstanceId: 1 } },
        { type: 'promise', name: 'reject', payload: { message: 'fail' }, meta: { instanceId: 1, invokeId: 1 } }
      ])
    })
})

testTrio('promise with callback in between', 'promise/inBetween', async spec => {
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
        { type: 'function', name: 'invoke', payload: [2], meta: { instanceId: 1, invokeId: 1 } },
        { type: 'function', name: 'return', meta: { instanceId: 1, invokeId: 1, returnType: 'promise', returnInstanceId: 1 } },
        {
          type: 'komondor',
          name: 'callback',
          payload: ['called'],
          meta: { sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourcePath: [1] }
        },
        { type: 'promise', name: 'resolve', payload: 3, meta: { instanceId: 1, invokeId: 1 } }
      ])
    })
})

testTrio('promise/returns/function', async spec => {
  const s = await spec(promiseChain.success)

  // not using `await` to make sure the return value is a promise.
  // `await` will hide the error if the return value is not a promise.
  return promise.increment(s.subject, 2)
    .then(actualFn => {
      t.equal(actualFn(), 3)
      return s.satisfy([
        { type: 'function', name: 'invoke', payload: ['increment', 2], meta: { instanceId: 1, invokeId: 1 } },
        { type: 'function', name: 'return', payload: {}, meta: { instanceId: 1, invokeId: 1, returnType: 'promise', returnInstanceId: 1 } },
        { type: 'promise', name: 'resolve', meta: { instanceId: 1, invokeId: 1, returnType: 'function', returnInstanceId: 2 } },
        {
          type: 'function',
          name: 'invoke',
          meta: {
            instanceId: 2,
            invokeId: 1,
            sourceType: 'promise',
            sourceInstanceId: 1,
            sourceInvokeId: 1,
            // TODO: empty path to indicate return can be confusing
            sourcePath: []
          }
        },
        { type: 'function', name: 'return', payload: 3, meta: { instanceId: 2, invokeId: 1 } }
      ])
    })
})
