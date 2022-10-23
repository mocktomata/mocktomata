import { createIO } from '@mocktomata/nodejs'
import { AsyncContext } from 'async-fp'
import { createStandardLog, Logger } from 'standard-log'
import { Mocktomata } from '../index.js'

export function createContext(options?: { io?: Mocktomata.IO, log?: Logger }) {
  return new AsyncContext(async () => {
    // TODO: the log needs to be configurable through env variables.
    // There is no way the user can change the log level as this is done during load time.
    const log = options?.log || createStandardLog().getLogger('mocktomata')
    const cwd = process.cwd()
    const io = options?.io || createIO({ cwd, log })
    // TODO: pass store to context
    return { io, log }
  })
}
