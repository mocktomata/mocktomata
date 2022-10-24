import { createConfigurator } from '@mocktomata/framework'
import { createIO } from '@mocktomata/nodejs'
import { AsyncContext } from 'async-fp'
import { createStandardLog, Logger } from 'standard-log'
import { createColorLogReporter } from 'standard-log-color'
import { Mocktomata } from '../index.js'

export function createContext(options?: { io?: Mocktomata.IO, log?: Logger }) {
  const configurator = createConfigurator()
  const context = new AsyncContext(async () => {
    // TODO: the log needs to be configurable through env variables.
    // There is no way the user can change the log level as this is done during load time.
    const log = options?.log || createStandardLog({ reporters: [createColorLogReporter()] })
      .getLogger('mocktomata')
    const cwd = process.cwd()
    const io = options?.io || createIO({ cwd, log })
    return { io, log, configurator }
  })

  return { context, config: configurator.config }
}
