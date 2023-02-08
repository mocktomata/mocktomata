import fs, { rmSync } from 'fs'
import mkdirp from 'mkdirp'

export function ensureFolderCreated(dir: string) {
	if (!fs.existsSync(dir)) mkdirp.sync(dir)
}

export function ensureFileNotExist(filePath: string) {
	if (fs.existsSync(filePath)) rmSync(filePath)
}
