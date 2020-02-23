import fs from 'fs'
import rimraf from 'rimraf'

export function ensureFileNotExists(filepath: string) {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath)
  }
}

export function ensureDirNotExists(dirpath: string) {
  if (fs.existsSync(dirpath)) {
    rimraf.sync(dirpath)
  }
}
