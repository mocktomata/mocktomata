import { Stream, Writable } from 'stream'

import { store } from './store'
import * as fileIO from './fileIO'
import { SpecRecord } from './interfaces'
import { getRemoteIO } from './remoteIO'

function getIO() {
  if (store.store && store.store.url) {
    return getRemoteIO(store.store.url)
  }
  return fileIO
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
  get createWriteStream(): (id: string) => Promise<Writable> {
    return getIO().createWriteStream
  },
  get createReadStream(): (id: string) => Promise<Stream> {
    return getIO().createReadStream
  }
}
