import { AsyncContext } from 'async-fp'
import { createStandardLogForTest } from 'standard-log'
import { createConfigurator, loadConfig } from '../config/index.js'
import { createTestIO } from './createTestIO.js'

export function createTestContext(options?: createTestIO.Options) {
  const io = createTestIO(options)
  const sl = createStandardLogForTest()
  const reporter = sl.reporter
  const log = sl.getLogger('mocktomata')
  const configurator = createConfigurator()
  if (options?.config) {
    configurator.config(options.config)
  }
  const context = new AsyncContext({ io, log, configurator }).extend(loadConfig)
  return { context, reporter }
}
