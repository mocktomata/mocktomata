import { dirname } from 'dirname-filename-esm'
import path from 'path'

export function fixturePath(dir: string) {
  return path.join(dirname(import.meta), `../../fixtures/${dir}`)
}
