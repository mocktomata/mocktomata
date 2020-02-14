import path from 'path'

export function fixturePath(dir: string) {
  return path.join(__dirname, `../../fixtures/${dir}`)
}
