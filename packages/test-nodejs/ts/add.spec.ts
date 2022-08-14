import { default as axios } from 'axios'
import { mockto } from 'mocktomata'
import { Calculator } from './Calculator.js'

afterAll(() => mockto.teardown())

mockto('1 + 1 = 2', (title, spec) => {
  test(title, async () => {
    const subject = await spec(axios)
    const calc = new Calculator(subject)
    const actual = await calc.add(1, 1)
    expect(actual).toBe(2)
    await spec.done()
  })
})
