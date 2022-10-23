import fs from 'fs'
import path from 'path'
import { genFilename } from './genFilename.js'

export function readFrom(baseDir: string, id: string, dupId = 0): string {
  const filename = genFilename(baseDir, id, dupId)
  const filePath = path.join(baseDir, filename)
  const content = fs.readFileSync(filePath, 'utf-8')
  const [firstLine, specStr] = content.split('\n', 2)
  if (firstLine !== id) {
    return readFrom(baseDir, id, dupId + 1)
  }
  return specStr
}
