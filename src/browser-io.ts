import { InvalidUsage } from 'assertron'

import { store } from './store'

import {
  SpecRecord,
  // @ts-ignore
  GivenRecord
} from './interfaces'
import { getServerIO } from './serverIO'

function getIO() {
  const registry = store.options.registry
  if (registry.type === 'file') {
    throw new InvalidUsage(`Registry type 'file' is not supported on browser`)
  }

  return getServerIO(registry.url)
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
  }
}
