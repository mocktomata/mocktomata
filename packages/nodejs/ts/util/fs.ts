import { existsSync, rmSync } from 'node:fs'
import { mkdirpSync } from 'mkdirp'

export function ensureFolderCreated(dir: string) {
	if (!existsSync(dir)) mkdirpSync(dir)
}

export function ensureFileNotExist(filePath: string) {
	if (existsSync(filePath)) rmSync(filePath)
}
