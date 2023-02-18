import { createStandardLog, logLevels, MemoryLogReporter } from 'standard-log'
import { createColorLogReporter } from 'standard-log-color'
import type { Spec } from '../spec/types.js'
import type { Log } from './types.js'

export function createLogContext({
	config,
	options,
	mode,
	specName,
	reporter
}: {
	reporter: MemoryLogReporter
	config: Log.Config
	options: Spec.Options
	mode: string
	specName: string
}) {
	const emitLog = options.emitLog ?? config.emitLog
	const logLevel = options.logLevel ?? config.logLevel ?? (emitLog ? logLevels.debug : undefined)
	const reporters = emitLog ? [createColorLogReporter(), reporter] : [reporter]
	const sl = createStandardLog({ logLevel, reporters })
	const log = sl.getLogger(`mocktomata:${specName}:${mode}`)
	return { log, logLevel }
}
