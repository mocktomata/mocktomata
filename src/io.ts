import * as fileIO from './fileIO'

/**
 * Factory for writer.
 * Depends on config, it will return different write funcitons,
 * such as file-base, database, or remote host
 */
export const io = {
  get readSpec() {
    return fileIO.readSpec
  },
  get writeSpec() {
    return fileIO.writeSpec
  }
}
