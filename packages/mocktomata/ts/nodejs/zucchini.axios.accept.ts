import { Zucchini } from '@mocktomata/framework'
import { a } from 'assertron'
import axios, { AxiosError } from 'axios'
import { defineStep, scenario } from './index.js'

afterAll(() => scenario.cleanup())

defineStep('{number} + {number}', async ({ spec }, a, b) => {
  const subject = await spec(axios)
  const r = await subject(`http://api.mathjs.org/v4/?expr=${a}%2b${b}`)
  return r.data
})

it('uses step along with spec', async () => {
  const { spec, run, done } = scenario('a + b - c')
  const plus = await run('2 + 3')
  expect(plus).toEqual(5)
  const s = await spec(axios)
  const r = await s(`http://api.mathjs.org/v4/?expr=${plus}-1`)
  expect(r.data).toEqual(4)
  await done()
})

it('works with axios throwing error', async () => {
  const { spec, done } = scenario('axios with error')
  const s = await spec(axios)
  // `+` is not valid
  const err = await a.throws<AxiosError>(s(`http://api.mathjs.org/v4/?expr=1+1`))
  expect(err.name).toEqual('AxiosError')
  expect(err.code).toEqual('ERR_BAD_REQUEST')
  expect(err.response?.status).toEqual(400)
  expect(err.response?.statusText).toEqual('Bad Request')
  expect(err.response?.data).toEqual('Error: Unexpected part "1" (char 3)')
  await done()
})

function add(step: Zucchini.StepCaller, a: number, b: number): Promise<number> {
  return step(`${a} + ${b}`)
}

it('can define custom function to run the step', async () => {
  const { run, done } = scenario('with custom step function')

  const plus = await add(run, 2, 3)
  expect(plus).toEqual(5)
  return done()
})
