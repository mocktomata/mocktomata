import { getLogger, Logger, logLevel } from '@unional/logging'

const log: Logger = getLogger('komondor')
log.setLevel(logLevel.none)
export { log }
