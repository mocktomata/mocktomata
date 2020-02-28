import { logLevels } from 'standard-log'
import { log } from '../log'
import { Spec } from './types'

export async function createLiveSpec(): Promise<Spec> {
  let enabledLog = false
  const origLogLevel = log.level
  return Object.assign(async (subject: any) => subject, {
    async done() {
      if (enabledLog) log.level = origLogLevel
    },
    enableLog: (level = logLevels.debug) => {
      enabledLog = true
      log.level = level
    },
  })
}
