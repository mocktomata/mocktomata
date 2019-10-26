import axios from 'axios'
import { mockto } from 'mocktomata'
import { Calculator } from './Calculator'
// import a from 'assertron'
// import delay from 'delay'

beforeAll(() => {
  mockto.start({ logOptions: { mode: 'test' } })
})

mockto.save('1 + 1 = 2', (specName, spec) => {
  test(specName, async () => {
    spec.enableLog()
    spec.logSpecRecord()

    // axios.get = () => {}
    const subject = await spec(axios)
    const calc = new Calculator(subject)
    const actual = await calc.add(1, 1)
    expect(actual).toBe(2)
    await spec.done()
  })
})
