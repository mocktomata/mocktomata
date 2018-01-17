import * as fileIO from './fileIO'

/**
 * Factory for writer.
 * Depends on config, it will return different write funcitons,
 * such as file-base, database, or remote host
 */
export const io = {
  readSpec(id: string) {
    return fileIO.readSpec(id)
  },
  getSpecWriter() {
    return fileIO.writeSpec
  }
}
