import path from 'path'
import { ensureFolderCreated, getHash, readByHash, writeTo } from '../util'
import { MOCKTOMATA_FOLDER } from '../constants'

export function createSpecRepository({ cwd }: createSpecRepository.Options) {
  const mocktomataFolder = path.resolve(cwd, MOCKTOMATA_FOLDER)
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

export namespace createSpecRepository {
  export type Options = {
    cwd: string
  }
}

function getSpecFolder(mocktomataFolder: string) {
  return path.resolve(mocktomataFolder, 'specs')
}
