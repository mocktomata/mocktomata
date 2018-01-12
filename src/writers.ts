import {
  // @ts-ignore
  CallRecord
} from 'satisfier'

import * as fileWriters from './fileWriters'
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
  getSpecWriter() {
    return fileWriters.writeSpec
  }
}
