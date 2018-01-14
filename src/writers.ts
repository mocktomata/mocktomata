import {
  // @ts-ignore
  CallRecord
} from 'satisfier'

import * as fileIO from './fileIO'
import {
  // @ts-ignore
  SpecRecord
} from './interfaces'

/**
 * Factory for writer.
 * Depends on config, it will return different write funcitons,
 * such as file-base, database, or remote host
 */
export const writers = {
  readSpec(id: string) {
    return fileIO.readSpec(id)
  },
  getSpecWriter() {
    return fileIO.writeSpec
  }
}
