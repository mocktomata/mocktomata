import path from 'path'
import { ensureFolderCreated, readFrom, writeTo } from '../util/index.js'

export function readSpec(specFolder: string, specName: string, invokePath: string) {
	const specDir = path.join(specFolder, invokePath)
	return readFrom(specDir, specName)
}

export function writeSpec(specFolder: string, specName: string, invokePath: string, data: string) {
	const specDir = path.join(specFolder, invokePath)
	ensureFolderCreated(specDir)
	writeTo(specDir, specName, data)
}
