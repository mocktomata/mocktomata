import { ensureFolderCreated, getHash, readByHash, writeTo } from '../util';
import path from 'path'

export function createScenarioIO(komondorFolder: string) {
  const dir = getScenarioFolder(komondorFolder)
  return {
    read(id: string) {
      const hash = getHash(id)
      return Promise.resolve().then(() => readByHash(dir, id, hash))
    },
    write(id: string, data: string) {
      ensureFolderCreated(dir)
      return writeTo(dir, id, data)
    }
  }
}

export function getScenarioFolder(komondorFolder: string) {
  return path.resolve(komondorFolder, 'scenarios')
}
