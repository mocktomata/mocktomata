import { existsSync, rmSync } from 'node:fs'
import mkdirp from 'mkdirp'

export function ensureFolderCreated(dir: string) {
	if (!existsSync(dir)) mkdirp.sync(dir)
}

export function ensureFileNotExist(filePath: string) {
	if (existsSync(filePath)) rmSync(filePath)
}
