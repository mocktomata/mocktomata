import path from 'node:path'
import { dirname } from 'dirname-filename-esm'

export function fixturePath(dir: string) {
	return path.join(dirname(import.meta), `../../fixtures/${dir}`)
}
