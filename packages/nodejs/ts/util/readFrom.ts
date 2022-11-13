import fs from 'fs'
import path from 'path'
import { genFilename } from './genFilename.js'

export function readFrom(baseDir: string, id: string, dupId = 0): string {
  const filename = genFilename(baseDir, id, dupId)
  const filePath = path.join(baseDir, filename)
  const content = fs.readFileSync(filePath, 'utf-8')
  const i = content.indexOf('\n')
  const firstLine = content.slice(0, i)
  const specStr = content.slice(i + 1)
  if (firstLine !== id) {
    return readFrom(baseDir, id, dupId + 1)
  }
  return specStr
}
