import { getHash } from './getHash.js'
import { writeByHash } from './writeByHash.js'

export function writeTo(baseDir: string, id: string, json: string) {
  const hash = getHash(id)
  writeByHash(baseDir, id, json, hash)
}
