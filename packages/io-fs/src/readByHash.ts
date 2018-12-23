import fs from 'fs';
import path from 'path';

export function readByHash<T>(baseDir: string, id: string, hash: string, dupId = 0): T {
  const filename = dupId ? hash + dupId : hash
  const filePath = path.join(baseDir, filename)
  const content = fs.readFileSync(filePath, 'utf-8')
  const [firstLine, jsonStr] = content.split('\n', 2)
  if (firstLine !== id) {
    return readByHash(baseDir, id, hash, dupId + 1)
  }
  const json = JSON.parse(jsonStr)
  return json
}
