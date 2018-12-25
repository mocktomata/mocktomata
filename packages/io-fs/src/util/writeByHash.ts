import fs from 'fs';
import path from 'path';

export function writeByHash(baseDir: string, id: string, json: string, hash: string, dupId = 0): void {
  const filename = dupId ? hash + dupId : hash
  const filePath = path.join(baseDir, filename)
  if (occupiedFile(filePath, id)) {
    writeByHash(baseDir, id, json, hash, dupId + 1)
  }
  else {
    fs.writeFileSync(filePath, `${id}\n${json}`)
  }
}

function occupiedFile(filepath: string, id: string) {
  if (!fs.existsSync(filepath)) return false

  const content = fs.readFileSync(filepath, 'utf-8')
  const firstline = content.split('\n')[0]
  return id !== firstline
}
