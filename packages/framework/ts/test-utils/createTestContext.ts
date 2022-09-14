import { AsyncContext } from 'async-fp'
import { createStandardLogForTest } from 'standard-log'
import { requiredDeep } from 'type-plus'
import { createTestIO } from './createTestIO.js'

export function createTestContext(options?: createTestIO.Options) {
  const { config, modules } = requiredDeep({
    config: { ecmaVersion: '2015', plugins: [] },
    modules: {}
  }, options)
  const io = createTestIO({ config, modules })
  const sl = createStandardLogForTest()
  const reporter = sl.reporter
  const log = sl.getLogger('mocktomata')
  const context = new AsyncContext({ config, io, log, timeTrackers: [], maskCriteria: [] })
  return { context, reporter }
}
