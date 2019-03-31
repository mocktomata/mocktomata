import { ScenarioNotFound } from '../errors';
import { ensureFolderCreated, getHash, readByHash, writeTo } from '../util';
import { getScenarioFolder } from './getScenerioFolder';

export function createScenarioIO(cwd: string) {
  const dir = getScenarioFolder(cwd)
  return {
    read(id: string) {
      const hash = getHash(id)
      return new Promise<any>((a, r) => {
        try {
          a(readByHash(dir, id, hash))
        }
        catch (err) {
          // istanbul ignore next
          if (err.code === 'ENOENT')
            r(new ScenarioNotFound(id))
          else {
            r(err)
          }
        }
      })
    },
    write(id: string, data: string) {
      ensureFolderCreated(dir)
      return writeTo(dir, id, data)
    }
  }
}
