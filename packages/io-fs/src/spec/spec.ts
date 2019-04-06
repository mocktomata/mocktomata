import path from 'path';
import { ensureFolderCreated, getHash, readByHash, writeTo } from '../util';

export function createSpecIO(komondorFolder: string) {
  const specDir = getSpecFolder(komondorFolder)
  return {
    readSpec(id: string) {
      const hash = getHash(id)
      return readByHash(specDir, id, hash)
    },
    writeSpec(id: string, data: string) {
      ensureFolderCreated(specDir)
      writeTo(specDir, id, data)
    }
  }
}

export function getSpecFolder(komondorFolder: string) {
  return path.resolve(komondorFolder, 'specs')
}
