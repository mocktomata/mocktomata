import a from 'assertron'
import { SpecNotFound, CannotConfigAfterUsed, config, mockto } from '..'
import { store } from './store'
import { createMockto } from '@mocktomata/framework'
import { createContext } from './createContext'
import { logLevels, captureLogs } from 'standard-log'
import { log } from '../log'

beforeEach(() => store.reset())

afterEach(() => store.value.config = undefined)

mockto('config() can only be called before using mockto', (title, spec) => {
  test(title, async () => {
    await spec({})
    a.throws(() => config({}), CannotConfigAfterUsed)
  })
})

test('override mode', () => {
  const mockto = createMockto(createContext())
  config({ overrideMode: 'simulate' })
  return new Promise(r => {
    mockto('save mode is overridden to simulate mode', async (_, spec) => {
      await a.throws(spec({}), SpecNotFound)
      r()
    })
  })
})

test('enable log', () => {
  const mockto = createMockto(createContext())
  config({ logLevel: logLevels.all })
  return new Promise(r => {
    mockto('log enabled', async (_, spec) => {
      const logs = await captureLogs(log, () => spec({}))
      a.satisfies(logs, [{ level: logLevels.debug }])
      r()
    })
  })
})
