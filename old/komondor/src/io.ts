import { getFileIO } from './fileIO'
import {
  SpecRecord,
  // @ts-ignore
  GivenRecord
} from './interfaces'
import { KOMONDOR_FOLDER } from './constants';

function getIO() {
  return getFileIO(KOMONDOR_FOLDER)
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
  get writeGiven() {
    return getIO().writeGiven
  },
  get readScenario(): (id: string) => Promise<any> {
    return getIO().readScenario
  },
  get writeScenario() {
    return getIO().writeScenario
  }
}
