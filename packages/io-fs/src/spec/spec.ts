import path from 'path';
import { ensureFolderCreated, getHash, readByHash, writeTo } from '../util';

export function createSpecRepository(mocktomataFolder: string) {
  const specDir = getSpecFolder(mocktomataFolder)
  return {
    async readSpec(id: string) {
      const hash = getHash(id)
      return readByHash(specDir, id, hash)
    },
    async writeSpec(id: string, data: string) {
      ensureFolderCreated(specDir)
      writeTo(specDir, id, data)
    }
  }
}

export function getSpecFolder(mocktomataFolder: string) {
  return path.resolve(mocktomataFolder, 'specs')
}
