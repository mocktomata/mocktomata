import axios from 'axios'
import { scenario, defineStep } from './index.js'

afterAll(() => scenario.cleanup())

defineStep('{number} + {number}', async ({ spec }, a, b) => {
  const subject = await spec(axios)
  const r = await subject(`http://api.mathjs.org/v4/?expr=${a}%2b${b}`)
  return r.data
})

it('uses step along with spec', async () => {
  const { spec, run, done } = scenario.save('a + b - c')
  const plus = await run('2 + 3')
  expect(plus).toEqual(5)
  const s = await spec(axios)
  const r = await s(`http://api.mathjs.org/v4/?expr=${plus}-1`)
  expect(r.data).toEqual(4)
  await done()
})

it.todo('when axios error')
