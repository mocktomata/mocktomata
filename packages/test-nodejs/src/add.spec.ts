import axios from 'axios'
import { mockto } from 'mocktomata'
import { Calculator } from './Calculator'

mockto('1 + 1 = 2', (specName, _spec) => {
  test(specName, async () => {
    // const subject = await spec(axios)
    const calc = new Calculator(axios)
    const actual = await calc.add(1, 1)
    expect(actual).toBe(2)
    // await spec.done()
  })
})
