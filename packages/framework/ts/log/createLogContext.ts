import { createStandardLog, MemoryLogReporter } from 'standard-log'
import { createColorLogReporter } from 'standard-log-color'
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
  const reporters = config.emitLog ? [createColorLogReporter(), reporter] : [reporter]
  const sl = createStandardLog({ logLevel: config.logLevel, reporters })
  const log = sl.getLogger(`mocktomata:${specName}:${mode}`)
  return { log }
}
