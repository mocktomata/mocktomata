// import { AssertOrder } from 'assertron'
import { test } from 'ava'
// import { onSetup, scenario } from './index'
test.todo('nothing to test')
// import { store } from './store'

// test('.run will be invoked with spec', async t => {
//   const order = new AssertOrder(1)
//   await scenario('run is invoked')
//     .run(spec => {
//       t.truthy(spec)
//       order.once(1)
//     })

//   order.end()
// })
// test('.skip will skip the scenario', t => {
//   onSetup(/reg/, () => {
//     t.fail('should not trigger')
//   })

//   scenario.skip('this scenario will be skipped')
//     .setup('registered')
//     .run(() => {
//       t.fail('should not reach')
//     })
//   store.envHandlers = []
// })

// test('throws error when the setup is not registered.', t => {
//   t.throws(() => scenario('setup will run').setup('not registered'), `Setup clause 'not registered' is not registered.`)
// })

// test('execute setup clause', () => {
//   const order = new AssertOrder(1)
//   onSetup('registered', () => {
//     order.once(1)
//   })

//   scenario('execute setup clause')
//     .setup('registered')

//   order.end()
//   store.envHandlers = []
// })

// test('execute setup clause with matching regex', () => {
//   const order = new AssertOrder(1)
//   onSetup(/reg/, () => {
//     order.once(1)
//   })

//   scenario('execute setup clause')
//     .setup('registered')

//   order.end()
//   store.envHandlers = []
// })

// test('execute run clause with setup', t => {
//   const order = new AssertOrder(2)
//   onSetup(/reg/, () => {
//     order.once(1)
//   })

//   scenario('execute setup clause')
//     .setup('registered')
//     .run(spec => {
//       t.truthy(spec)
//       order.once(2)
//     })

//   order.end()
//   store.envHandlers = []
// })

// test('skipSetup() will not run setup clause', t => {
//   const order = new AssertOrder(1)
//   onSetup(/reg/, () => {
//     t.fail('should not trigger')
//   })

//   scenario.skipSetup('setup clause will be skipped')
//     .setup('registered')
//     .run(spec => {
//       t.truthy(spec)
//       order.once(1)
//     })

//   order.end()
//   store.envHandlers = []
// })

// test('setup clause can be inlined', t => {
//   const order = new AssertOrder(2)

//   scenario('inline setup clause')
//     .setup('setup', (spec) => {
//       t.truthy(spec)
//       order.once(1)
//     })
//     .run(spec => {
//       t.truthy(spec)
//       order.once(2)
//     })

//   order.end()
//   t.is(store.envHandlers.length, 0)
// })

// test('inline setup clause is skipped for .skip()', t => {
//   scenario.skip('inline setup clause skipped')
//     .setup('setup', () => {
//       t.fail('should not reach')
//     })
//     .run(() => {
//       t.fail('should not reach')
//     })
// })

// test('inline setup clause is skipped for .skipSetup()', t => {
//   const order = new AssertOrder(1)

//   scenario.skipSetup('inline setup clause skipped')
//     .setup('setup', () => {
//       t.fail('should not reach')
//     })
//     .run(() => {
//       order.once(1)
//     })

//   order.end()
// })

// test('.save(...) will ')

// // test('config to run skipped scenarios', async t => {
// //   const order = new AssertOrder(1)
// //   config({
// //     scenario: 'skipped but run',
// //     mode: 'run'
// //   })
// //   try {
// //     await scenario.skip('skipped but ran')
// //       .run(() => {
// //         order.once(1)
// //       })
// //     order.end()
// //   }
// //   finally {
// //     config()
// //   }
// // })
