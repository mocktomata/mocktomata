import { createConsoleLogReporter, createStandardLog, MemoryLogReporter } from 'standard-log'
import { Log } from './types.js'

export function createLogContext({
  config,
  mode,
  specName,
  reporter }: {
    reporter: MemoryLogReporter,
    config: Log.Config,
    mode: string,
    specName: string
  }) {
  const sl = createStandardLog({ logLevel: config.logLevel, reporters: [createConsoleLogReporter(), reporter] })
  const log = sl.getLogger(`mocktomata:${specName}:${mode}`)
  return { log }
}
