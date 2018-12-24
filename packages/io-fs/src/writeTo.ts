import { getHash } from './getHash';
import { writeByHash } from './writeByHash';

export function writeTo(baseDir: string, id: string, json: string) {
  const hash = getHash(id)
  return new Promise<undefined>((a, r) => {
    try {
      writeByHash(baseDir, id, json, hash)
      a()
    }
    catch (err) {
      // istanbul ignore next
      r(err)
    }
  })
}
