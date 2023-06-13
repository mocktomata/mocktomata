import type { Logger, LogLevel } from '../standard_log.types.js'

export namespace Log {
	export type Context = { log: Logger; logLevel?: LogLevel }
	export type Config = {
		emitLog?: boolean
		logLevel?: LogLevel
	}
}
