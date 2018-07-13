import { createFileIO } from './fileIO'
import {
  SpecRecord
} from './interfaces'

let actualIO: any
function getIO() {
  return actualIO || (actualIO = createFileIO())
}

/**
 * Factory for writer.
 * Depends on config, it will return different write funcitons,
 * such as file-base, database, or remote host
 */
export const io = {
  get readSpec(): (id: string) => Promise<SpecRecord> {
    return getIO().readSpec
  },
  get writeSpec(): (id: string, record: SpecRecord) => Promise<void> {
    return getIO().writeSpec
  },
  get readScenario(): (id: string) => Promise<any> {
    return getIO().readScenario
  },
  get writeScenario() {
    return getIO().writeScenario
  }
}
