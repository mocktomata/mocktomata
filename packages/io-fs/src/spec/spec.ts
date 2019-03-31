import { SpecNotFound } from '../errors';
import { ensureFolderCreated, getHash, readByHash, writeTo } from '../util';
import { getSpecFolder } from './getSpecFolder';


export function createSpecIO(cwd: string) {
  const specDir = getSpecFolder(cwd)
  return {
    read(id: string) {
      const hash = getHash(id)
      return new Promise<string>((a, r) => {
        try {
          a(readByHash(specDir, id, hash))
        }
        catch (err) {
          // istanbul ignore next
          if (err.code === 'ENOENT')
            r(new SpecNotFound(id))
          else {
            r(err)
          }
        }
      })
    },
    write(id: string, data: string) {
      ensureFolderCreated(specDir)
      return writeTo(specDir, id, data)
    }
  }
}
