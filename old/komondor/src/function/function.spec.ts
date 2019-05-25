import t from 'assert'
import a, { satisfy, AssertOrder } from 'assertron'

import { spec, SpecNotFound, functionConstructed, functionInvoked, functionReturned, functionThrown } from '..'
import {
  simpleCallback,
  fetch,
  literalCallback,
  synchronous,
  delayed,
  recursive,
  postReturn
} from './testSuites'
import k from '../testUtil'

function increment(x) {
  return x + 1;
}
function doThrow() {
  throw new Error('throwing');
}

test('acceptance', async () => {
  const inc = await spec(increment)
  inc.subject(1)

  await inc.satisfy([
    { ...functionConstructed({ functionName: 'increment' }), instanceId: 1 },
    { ...functionInvoked(1), instanceId: 1, invokeId: 1 },
    { ...functionReturned(2), instanceId: 1, invokeId: 1 }
  ])

  const s = await spec(doThrow)
  a.throws(() => s.subject())

  await s.satisfy([
    { ...functionConstructed({ functionName: 'doThrow' }), instanceId: 1 },
    { ...functionInvoked(), instanceId: 1, invokeId: 1 },
    { ...functionThrown({ message: 'throwing' }), instanceId: 1, invokeId: 1 }
  ])
})

// test('get same object if nothing to spy on', async () => {
//   t.deepStrictEqual(await testObject({}), {})
//   t.deepStrictEqual(await testObject({ a: 1 }), { a: 1 })
//   t.deepStrictEqual(await testObject({ a: true }), { a: true })
//   t.deepStrictEqual(await testObject({ a: 'a' }), { a: 'a' })
// })

async function testObject(expected) {
  const objSpec = await spec(() => expected)
  const actual = objSpec.subject()
  t.deepStrictEqual(actual, expected)
  return actual
}

// test('simulate with not existing record will throw', async () => {
//   return a.throws(spec.simulate('function/simpleCallback/notExist', simpleCallback.success), SpecNotFound)
// })

// k.trio('onAny(callback) will invoke on any action', 'function/simpleCallback/success', (title, spec) => {
//   test(title, async () => {
//     const o = new AssertOrder(1)
//     const s = await spec(simpleCallback.success)

//     s.onAny(action => {
//       o.exactly(1, 5)
//       t(action)
//     })

//     await simpleCallback.increment(s.subject, 2)
//     o.end()
//   })
// })

// k.trio('function/simpleCallback/success', (title, spec) => {
//   test(title, async () => {
//     const o = new AssertOrder(4)
//     const s = await spec(simpleCallback.success)

//     s.on('function', 'invoke', action => {
//       o.on(1, () => satisfy(action, { ...functionInvoked(2), instanceId: 1, invokeId: 1 }))
//       o.on(2, () => satisfy(action, { ...functionInvoked(null, 3), instanceId: 2, invokeId: 1 }))
//       o.any([1, 2])
//     })

//     s.on('function', 'return', action => {
//       o.on(3, () => satisfy(action, { ...functionReturned(), instanceId: 2, invokeId: 1 }))
//       o.on(4, () => satisfy(action, { ...functionReturned(), instanceId: 1, invokeId: 1 }))
//       o.any([3, 4])
//     })

//     await simpleCallback.increment(s.subject, 2)

//     await s.satisfy([
//       { ...functionConstructed({ functionName: 'success' }), instanceId: 1 },
//       { ...functionInvoked(2), instanceId: 1, invokeId: 1 },
//       { ...functionConstructed(), instanceId: 2, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [1] },
//       { ...functionInvoked(null, 3), instanceId: 2, invokeId: 1 },
//       { ...functionReturned(), instanceId: 2, invokeId: 1 },
//       { ...functionReturned(), instanceId: 1, invokeId: 1 }
//     ])
//     o.end()
//   })
// })

// k.trio('function/simpleCallback/fail', (title, spec) => {
//   test(title, async () => {
//     const o = new AssertOrder(3)
//     const s = await spec(simpleCallback.fail)

//     s.on('function', 'invoke', action => {
//       o.on(1, () => satisfy(action, { ...functionInvoked(2), instanceId: 1, invokeId: 1 }))
//       o.on(2, () => satisfy(action, { ...functionInvoked({ message: 'fail' }), instanceId: 2, invokeId: 1 }))
//       o.any([1, 2])
//     })

//     s.on('function', 'return', action => {
//       o.on(3, () => satisfy(action, { ...functionReturned(), instanceId: 2, invokeId: 1 }))
//       o.on(4, () => satisfy(action, { ...functionReturned(), instanceId: 1, invokeId: 1 }))
//       o.any([3, 4])
//     })

//     return simpleCallback.increment(s.subject, 2)
//       .then(() => t.fail('should not reach'))
//       .catch(async () => {
//         await s.satisfy([
//           { ...functionConstructed({ functionName: 'fail' }), instanceId: 1 },
//           { ...functionInvoked(2), instanceId: 1, invokeId: 1 },
//           { ...functionConstructed(), instanceId: 2, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [1] },
//           { ...functionInvoked({ message: 'fail' }), instanceId: 2, invokeId: 1 },
//           { ...functionReturned(), instanceId: 2, invokeId: 1 },
//           { ...functionReturned(), instanceId: 1, invokeId: 1 }])
//         o.end()
//       })
//   })
// })

// k.trio('function spec can be called multiple times', 'spec/delayed/multiple', (title, spec) => {
//   test(title, async () => {
//     const s = await spec(delayed.success)
//     await delayed.increment(s.subject, 2)
//     await delayed.increment(s.subject, 4)

//     await s.satisfy([
//       { ...functionConstructed({ functionName: 'success' }), instanceId: 1 },
//       { ...functionInvoked(2), instanceId: 1, invokeId: 1 },
//       { ...functionConstructed(), instanceId: 2, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [1] },
//       { ...functionReturned(), instanceId: 1, invokeId: 1 },
//       { ...functionInvoked(null, 3), instanceId: 2, invokeId: 1 },
//       { ...functionReturned(), instanceId: 2, invokeId: 1 },
//       { ...functionInvoked(4), instanceId: 1, invokeId: 2 },
//       { ...functionConstructed(), instanceId: 3, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 2, sourceSite: [1] },
//       { ...functionReturned(), instanceId: 1, invokeId: 2 },
//       { ...functionInvoked(null, 5), instanceId: 3, invokeId: 1 },
//       { ...functionReturned(), instanceId: 3, invokeId: 1 }
//     ])
//   })
// })

// k.trio('function/fetch/success', (title, spec) => {
//   test(title, async () => {
//     const s = await spec(fetch.success)

//     const actual = await fetch.add(s.subject, 1, 2)

//     await s.satisfy([
//       { ...functionConstructed({ functionName: 'success' }), instanceId: 1 },
//       { ...functionInvoked('remoteAdd', { x: 1, y: 2 }), instanceId: 1, invokeId: 1 },
//       { ...functionConstructed(), instanceId: 2, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [2] },
//       { ...functionInvoked(null, 3), instanceId: 2, invokeId: 1 },
//       { ...functionReturned(), instanceId: 2, invokeId: 1 },
//       { ...functionReturned(), instanceId: 1, invokeId: 1 }
//     ])
//     t.strictEqual(actual, 3)
//   })
// })

// k.trio('function/fetch/fail', (title, spec) => {
//   test(title, async () => {
//     const s = await spec(fetch.fail)
//     return fetch.add(s.subject, 1, 2)
//       .then(() => t.fail('should not reach'))
//       .catch(() => {
//         return s.satisfy([
//           { ...functionConstructed({ functionName: 'fail' }), instanceId: 1 },
//           { ...functionInvoked('remoteAdd', { x: 1, y: 2 }), instanceId: 1, invokeId: 1 },
//           { ...functionConstructed(), instanceId: 2, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [2] },
//           { ...functionInvoked({ message: 'fail' }), instanceId: 2, invokeId: 1 },
//           { ...functionReturned(), instanceId: 2, invokeId: 1 },
//           { ...functionReturned(), instanceId: 1, invokeId: 1 }
//         ])
//       })
//   })
// })

// k.trio('function/literalCallback/success', (title, spec) => {
//   test(title, async () => {
//     const s = await spec(literalCallback.success)
//     const actual = await literalCallback.increment(s.subject, 2)

//     t.strictEqual(actual, 3)

//     await s.satisfy([
//       { ...functionConstructed({ functionName: 'success' }), instanceId: 1 },
//       { ...functionInvoked({ data: 2 }), instanceId: 1, invokeId: 1 },
//       { ...functionConstructed(), instanceId: 2, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [0, 'error'] },
//       { ...functionConstructed(), instanceId: 3, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [0, 'success'] },
//       { ...functionInvoked(3), instanceId: 3, invokeId: 1 },
//       { ...functionReturned(), instanceId: 3, invokeId: 1 },
//       { ...functionReturned(), instanceId: 1, invokeId: 1 }
//     ])
//   })
// })

// k.trio('function/literalCallback/fail', (title, spec) => {
//   test(title, async () => {
//     const s = await spec(literalCallback.fail)
//     await literalCallback.increment(s.subject, 2)
//       .then(() => t.fail('should not reach'))
//       .catch(() => {
//         return s.satisfy([
//           { ...functionConstructed({ functionName: 'fail' }), instanceId: 1 },
//           { ...functionInvoked({ data: 2 }), instanceId: 1, invokeId: 1 },
//           { ...functionConstructed(), instanceId: 2, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [0, 'error'] },
//           { ...functionConstructed(), instanceId: 3, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [0, 'success'] },
//           { ...functionInvoked(undefined, undefined, { message: 'fail' }), instanceId: 2, invokeId: 1 },
//           { ...functionReturned(), instanceId: 2, invokeId: 1 },
//           { ...functionReturned(), instanceId: 1, invokeId: 1 }
//         ])
//       })
//   })
// })

// k.trio('function/synchronous/success', (title, spec) => {
//   test(title, async () => {
//     const speced = await spec(synchronous.success)
//     const actual = synchronous.increment(speced.subject, 2)

//     t.strictEqual(actual, 3)
//     await speced.satisfy([
//       { ...functionConstructed({ functionName: 'success' }), instanceId: 1 },
//       { ...functionInvoked('increment', 2), instanceId: 1, invokeId: 1 },
//       { ...functionReturned(3), instanceId: 1, invokeId: 1 }
//     ])
//   })
// })

// k.trio('function/synchronous/fail', (title, spec) => {
//   test(title, async () => {
//     const s = await spec(synchronous.fail)

//     a.throws(() => synchronous.increment(s.subject, 2), e => e instanceof Error && e.message === 'fail')

//     await s.satisfy([
//       { ...functionConstructed({ functionName: 'fail' }), instanceId: 1 },
//       { ...functionInvoked('increment', 2), instanceId: 1, invokeId: 1 },
//       { ...functionThrown({ message: 'fail' }), instanceId: 1, invokeId: 1 }
//     ])
//   })
// })

// k.trio('function/recursive/twoCalls', (title, spec) => {
//   test(title, async () => {
//     const s = await spec(recursive.success)
//     const actual = await recursive.decrementToZero(s.subject, 2)
//     t.strictEqual(actual, 0)

//     await s.satisfy([
//       { ...functionConstructed({ functionName: 'success' }), instanceId: 1 },
//       { ...functionInvoked(2), instanceId: 1, invokeId: 1 },
//       { ...functionConstructed(), instanceId: 2, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [1] },
//       { ...functionInvoked(null, 1), instanceId: 2, invokeId: 1 },

//       { ...functionInvoked(1), instanceId: 1, invokeId: 2 },
//       { ...functionConstructed(), instanceId: 3, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 2, sourceSite: [1] },
//       { ...functionInvoked(null, 0), instanceId: 3, invokeId: 1 },
//       { ...functionReturned(), instanceId: 3, invokeId: 1 },
//       { ...functionReturned(), instanceId: 1, invokeId: 2 },
//       { ...functionReturned(), instanceId: 2, invokeId: 1 },
//       { ...functionReturned(), instanceId: 1, invokeId: 1 }
//     ])
//   })
// })

// k.trio('function/postReturn/success', (title, spec) => {
//   test(title, async () => {
//     const s = await spec(postReturn.fireEvent)
//     // console.log(s.actions)
//     await new Promise(a => {
//       let called = 0
//       s.subject('event', 3, () => {
//         called++
//         // console.log('received event', called)
//         if (called === 3)
//           a()
//       })
//     })

//     await s.satisfy([
//       { ...functionConstructed({ functionName: 'fireEvent' }), instanceId: 1 },
//       { ...functionInvoked('event', 3), instanceId: 1, invokeId: 1 },
//       { ...functionConstructed(), instanceId: 2, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [2] },
//       { ...functionReturned(), instanceId: 1, invokeId: 1 },
//       { ...functionInvoked('event'), instanceId: 2, invokeId: 1 },
//       { ...functionReturned(), instanceId: 2, invokeId: 1 },
//       { ...functionInvoked('event'), instanceId: 2, invokeId: 2 },
//       { ...functionReturned(), instanceId: 2, invokeId: 2 },
//       { ...functionInvoked('event'), instanceId: 2, invokeId: 3 },
//       { ...functionReturned(), instanceId: 2, invokeId: 3 }
//     ])
//   })
// })

k.trio('function/arrayArgs/success', (title, spec) => {
  test(title, async () => {
    const s = await spec(function takeArray(name, args) { return { name, args } })
    const actual = s.subject('node', ['--version'])

    t.strictEqual(actual.name, 'node')
    t(Array.isArray(actual.args))
    t.strictEqual(actual.args[0], '--version')
    await s.satisfy([])
  })
})

k.trio('function/composite', (title, spec) => {
  test(title, async () => {
    const subject = Object.assign(
      function (x) { return x },
      {
        type: 'func'
      }
    )
    const s = await spec(subject)
    t.strictEqual(s.subject(3), 3)
    t.strictEqual(s.subject.type, 'func')
    await s.done()
  })
})
