import { SPECS_FOLDER } from '../constants';
import { ensureFolderCreated } from '../util/ensureFolderCreated';
import { SpecNotFound } from '../errors';
import { getHash } from '../util/getHash';
import { readByHash } from '../util/readByHash';
import { writeTo } from '../util/writeTo';

export function readSpec(id: string) {
  const hash = getHash(id)
  return new Promise<string>((a, r) => {
    try {
      a(readByHash(readSpec.dir, id, hash))
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
}

readSpec.dir = SPECS_FOLDER

export function writeSpec(id: string, specStr: string) {
  ensureFolderCreated(writeSpec.dir)
  return writeTo(writeSpec.dir, id, specStr)
}

writeSpec.dir = SPECS_FOLDER
