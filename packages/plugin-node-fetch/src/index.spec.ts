import { incubator } from '@mocktomata/framework'
import fetch from 'node-fetch'

incubator('call echo with url string', (title, spec) => {
  test(title, async () => {
    const f = await spec(fetch)

    const response = await f('https://postman-echo.com/get?foo=foo1')
    const actual = await response.json()

    expect(actual.args).toEqual({ foo: 'foo1' })
    await spec.done()
  })
})
