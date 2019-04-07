import { ensureFolderCreated, getHash, readByHash, writeTo } from '../util';
import path from 'path'

export function createScenarioRepository(komondorFolder: string) {
  const dir = getScenarioFolder(komondorFolder)
  return {
    async readScenario(id: string) {
      const hash = getHash(id)
      return readByHash(dir, id, hash)
    },
    async writeScenario(id: string, data: string) {
      ensureFolderCreated(dir)
      writeTo(dir, id, data)
    }
  }
}

export function getScenarioFolder(komondorFolder: string) {
  return path.resolve(komondorFolder, 'scenarios')
}
