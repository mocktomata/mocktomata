import fs from 'fs'
import path from 'path'
import { genFilename } from './genFilename.js'

export function writeTo(baseDir: string, id: string, json: string, dupId = 0) {
	const filename = genFilename(baseDir, id, dupId)
	const filePath = path.join(baseDir, filename)
	if (occupiedFile(filePath, id)) {
		writeTo(baseDir, id, json, dupId + 1)
	} else {
		fs.writeFileSync(filePath, `${id}\n${json}`)
	}
}

function occupiedFile(filepath: string, id: string) {
	if (!fs.existsSync(filepath)) return false

	const content = fs.readFileSync(filepath, 'utf-8')
	const firstline = content.split('\n')[0]
	return id !== firstline
}
