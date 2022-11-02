import { MOCKTOMATA_MODE, MOCKTOMATA_FILE_PATH_FILTER, MOCKTOMATA_LOG_LEVEL, MOCKTOMATA_SPEC_NAME_FILTER } from './constants.js'
import { reduceOr } from './reduceOr.js'

export function loadConfigFromEnv() {
  return ['env', reduceOr([
    ['overrideMode', process.env[MOCKTOMATA_MODE]],
    ['logLevel', process.env[MOCKTOMATA_LOG_LEVEL]],
    ['filePathFilter', process.env[MOCKTOMATA_FILE_PATH_FILTER]],
    ['specNameFilter', process.env[MOCKTOMATA_SPEC_NAME_FILTER]]
  ])] as const
}
