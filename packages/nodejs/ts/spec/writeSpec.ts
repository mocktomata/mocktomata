import path from 'path'
import { ensureFolderCreated, writeTo } from '../util/index.js'

export function writeSpec(specFolder: string, specName: string, invokePath: string, data: string) {
	const specDir = path.join(specFolder, invokePath)
	ensureFolderCreated(specDir)
	writeTo(specDir, specName, data)
}
