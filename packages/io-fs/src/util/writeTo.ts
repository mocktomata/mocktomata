import { getHash } from './getHash'
import { writeByHash } from './writeByHash'

export function writeTo(baseDir: string, id: string, json: string) {
  const hash = getHash(id)
  writeByHash(baseDir, id, json, hash)
}
