import path from 'path'
import { readFrom } from '../util/index.js'

export function readSpec(specFolder: string, title: string, invokePath: string) {
  const specDir = path.join(specFolder, invokePath)
  return readFrom(specDir, title)
}
