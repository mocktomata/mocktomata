import fs from 'fs'
import path from 'path'
import { genFilename } from './filename.js'

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
