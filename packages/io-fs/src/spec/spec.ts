import path from 'path';
import { ensureFolderCreated, getHash, readByHash, writeTo } from '../util';

export function createSpecRepository(komondorFolder: string) {
  const specDir = getSpecFolder(komondorFolder)
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

export function getSpecFolder(komondorFolder: string) {
  return path.resolve(komondorFolder, 'specs')
}