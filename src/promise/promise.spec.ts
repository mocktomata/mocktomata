import t from 'assert'
import { setTimeout } from 'timers'

import { spec } from '../index'

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

test('live with noReturn', async () => {
  const noReturnSpec = await spec(noReturn.success)
  return noReturn.doSomething(noReturnSpec.subject)
    .then(() => {
      return noReturnSpec.satisfy([
        { type: 'fn/invoke' },
        { type: 'fn/return', meta: { returnType: 'promise' } },
        { type: 'promise/resolve' }
      ])
    })
})

test('save with noReturn', async () => {
  const noReturnSpec = await spec.save('promise/noReturn', noReturn.success)
  return noReturn.doSomething(noReturnSpec.subject)
    .then(() => {
      return noReturnSpec.satisfy([
        { type: 'fn/invoke' },
        { type: 'fn/return', meta: { returnType: 'promise' } },
        { type: 'promise/resolve' }
      ])
    })
})

test('simulate with noReturn', async () => {
  const noReturnSpec = await spec.simulate('promise/noReturn', noReturn.success)
  return noReturn.doSomething(noReturnSpec.subject)
    .then(() => {
      return noReturnSpec.satisfy([
        { type: 'fn/invoke' },
        { type: 'fn/return', meta: { returnType: 'promise' } },
        { type: 'promise/resolve' }
      ])
    })
})

test('promise live', async () => {
  const speced = await spec(promise.success)
  // not using `await` to make sure the return value is a promise.
  // `await` will hide the error if the return value is not a promise.
  return promise.increment(speced.subject, 2)
    .then(actual => {
      t.equal(actual, 3)
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise/resolve', payload: 3 }
      ])
    })
})

test('promise verify save', async () => {
  const speced = await spec.save('promise/resolve', promise.success)
  return promise.increment(speced.subject, 2)
    .then(actual => {
      t.equal(actual, 3)
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise/resolve', payload: 3 }
      ])
    })
})

test('promise verify simulate', async () => {
  const speced = await spec.simulate('promise/resolve', promise.success)
  return promise.increment(speced.subject, 2)
    .then(actual => {
      t.equal(actual, 3)
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise/resolve', payload: 3 }
      ])
    })
})

test('promise rejected verify', async () => {
  const speced = await spec(promise.fail)
  return promise.increment(speced.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise/reject', payload: { message: 'fail' } }
      ])
    })
})

test('promise rejected save', async () => {
  const speced = await spec.save('promise/reject', promise.fail)
  return promise.increment(speced.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise/reject', payload: { message: 'fail' } }
      ])
    })
})

test('promise rejected simulate', async () => {
  const speced = await spec.simulate('promise/reject', promise.fail)
  return promise.increment(speced.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise/reject', payload: { message: 'fail' } }
      ])
    })
})

test('promise with callback in between', async () => {
  function foo(x, cb) {
    return new Promise(a => {
      setTimeout(() => {
        cb('called')
        a(x + 1)
      }, 10)
    })
  }
  const fooSpec = await spec(foo);

  let fooing
  return new Promise(a => {
    fooing = fooSpec.subject(2, msg => {
      t.equal(msg, 'called')
      a()
    })
  })
    .then(() => fooing)
    .then(actual => {
      t.equal(actual, 3)
      return fooSpec.satisfy([
        { type: 'fn/invoke', payload: [2] },
        { type: 'fn/return', meta: { returnType: 'promise' } },
        { type: 'fn/callback', payload: ['called'] },
        { type: 'promise/resolve', payload: 3 }
      ])
    })
})

test('promise returns function live', async () => {
  const speced = await spec(promiseChain.success)
  // not using `await` to make sure the return value is a promise.
  // `await` will hide the error if the return value is not a promise.
  return promise.increment(speced.subject, 2)
    .then(actualFn => {
      t.equal(actualFn(), 3)
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise/resolve' },
        { type: 'fn/invoke' },
        { type: 'fn/return', payload: 3 }
      ])
    })
})

test('promise returns function save', async () => {
  const speced = await spec.save('promise/returns/function', promiseChain.success)
  // not using `await` to make sure the return value is a promise.
  // `await` will hide the error if the return value is not a promise.
  return promise.increment(speced.subject, 2)
    .then(actualFn => {
      t.equal(actualFn(), 3)
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise/resolve' },
        { type: 'fn/invoke' },
        { type: 'fn/return', payload: 3 }
      ])
    })
})


test('promise returns function simulate', async () => {
  const speced = await spec.simulate('promise/returns/function', promiseChain.success)
  // not using `await` to make sure the return value is a promise.
  // `await` will hide the error if the return value is not a promise.
  return promise.increment(speced.subject, 2)
    .then(actualFn => {
      t.equal(actualFn(), 3)
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise/resolve' },
        { type: 'fn/invoke' },
        { type: 'fn/return', payload: 3 }
      ])
    })
})
