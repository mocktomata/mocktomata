import { getHash } from './getHash';
import { writeByHash } from './writeByHash';

export function writeTo(baseDir: string, id: string, json: string) {
  const hash = getHash(id)
  return new Promise<void>((a, r) => {
    try {
      a(writeByHash(baseDir, id, json, hash))
    }
    catch (err) {
      // istanbul ignore next
      r(err)
    }
  })
}
