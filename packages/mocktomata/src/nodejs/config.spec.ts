import a from 'assertron'
import { CannotConfigAfterUsed, config, mockto } from '..'
import { store } from './store'

beforeEach(() => {
  store.reset()
})

// afterEach(() => {
//   store.value.config = { plugins: [] }
//   store.value.context?.clear()
// })

mockto('config() can only be called before using mockto', (title, spec) => {
  test(title, async () => {
    await spec({})
    a.throws(() => config({}), CannotConfigAfterUsed)
  })
})

// mockto('override to simulate mode', (title, spec) => {
//   test(title, async () => {
//     // config({ overrideMode: 'live' })
//     const s = await spec((i: number) => i + 1)
//     const actual = s(1)
//     expect(actual).toBe(2)
//     await spec.done()
//   })
// })

// test('can specify ecmaVersion to ES2015', async () => {
//   config({ ecmaVersion: 'ES2015' })
// });
