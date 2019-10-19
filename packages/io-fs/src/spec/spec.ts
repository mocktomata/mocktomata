import path from 'path';
import { ensureFolderCreated, getHash, readByHash, writeTo } from '../util';

export function createSpecRepository(mocktomataFolder: string) {
  const baseDir = getSpecFolder(mocktomataFolder)
  return {
    async readSpec(title: string, invokePath: string) {
      const hash = getHash(title)
      const specDir = path.join(baseDir, invokePath)
      return readByHash(specDir, title, hash)
    },
    async writeSpec(title: string, invokePath: string, data: string) {
      const specDir = path.join(baseDir, invokePath)
      ensureFolderCreated(specDir)
      writeTo(specDir, title, data)
    }
  }
}

export function getSpecFolder(mocktomataFolder: string) {
  return path.resolve(mocktomataFolder, 'specs')
}
