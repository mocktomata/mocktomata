import path from 'path';
import { ensureFolderCreated, getHash, readByHash, writeTo } from '../util';

export function createScenarioRepository(mocktomataFolder: string) {
  const dir = getScenarioFolder(mocktomataFolder)
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

export function getScenarioFolder(mocktomataFolder: string) {
  return path.resolve(mocktomataFolder, 'scenarios')
}
