import * as fileIO from './fileIO'
import {
  SpecRecord
} from './interfaces'
/**
 * Factory for writer.
 * Depends on config, it will return different write funcitons,
 * such as file-base, database, or remote host
 */
export const io = {
  get readSpec(): (id: string) => Promise<SpecRecord | undefined> {
    return fileIO.readSpec
  },
  get writeSpec(): (id: string, record: SpecRecord) => void {
    return fileIO.writeSpec
  }
}
