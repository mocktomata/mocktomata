import path from 'path';
import { ensureFolderCreated, getHash, readByHash, writeTo } from '../util';

export function createSpecIO(komondorFolder: string) {
  const specDir = getSpecFolder(komondorFolder)
  return {
    read(id: string) {
      const hash = getHash(id)
      return readByHash(specDir, id, hash)
    },
    write(id: string, data: string) {
      ensureFolderCreated(specDir)
      writeTo(specDir, id, data)
    }
  }
}

export function getSpecFolder(komondorFolder: string) {
  return path.resolve(komondorFolder, 'specs')
}
