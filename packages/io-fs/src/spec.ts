import { SPECS_FOLDER } from './constants';
import { ensureFolderCreated } from './ensureFolderCreated';
import { SpecNotFound } from './errors';
import { getHash } from './getHash';
import { SpecRecord } from './interfaces';
import { readByHash } from './readByHash';
import { writeTo } from './writeTo';

export function readSpec(id: string) {
  const hash = getHash(id)
  return new Promise<SpecRecord>((a, r) => {
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

export function writeSpec(id: string, record: SpecRecord) {
  ensureFolderCreated(writeSpec.dir)
  return writeTo(writeSpec.dir, id, JSON.stringify(record))
}

writeSpec.dir = SPECS_FOLDER
