import { store } from './store'
import { getFileIO } from './fileIO'
import {
  SpecRecord,
  // @ts-ignore
  GivenRecord
} from './interfaces'
import { getServerIO } from './serverIO'

function getIO() {
  const registry = store.options.registry
  switch (registry.type) {
    case 'server':
      return getServerIO(registry.url)
    case 'file':
    default:
      return getFileIO(registry.path)
  }
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
  get writeScenario() {
    return getIO().writeScenario
  }
}
