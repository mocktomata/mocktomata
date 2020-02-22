import a from 'assertron'
import { CannotConfigAfterUsed, config, mockto } from '..'

mockto('config() can only be called before using mockto', (title, spec) => {
  test(title, async () => {
    await spec({})
    a.throws(() => config({}), CannotConfigAfterUsed)
  })
})
