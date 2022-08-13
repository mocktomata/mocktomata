import path from 'path'
import { getHash, readByHash } from '../util'

export function readSpec(specFolder: string, title: string, invokePath: string) {
  const hash = getHash(title)
  const specDir = path.join(specFolder, invokePath)
  return readByHash(specDir, title, hash)
}
