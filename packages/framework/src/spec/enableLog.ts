import { logLevel } from 'standard-log'
import { log } from '../log'

export function enableLog(level = logLevel.debug) {
  log.level = level
}
