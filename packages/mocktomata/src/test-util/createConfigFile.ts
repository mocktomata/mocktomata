import fs from 'fs'
import path from 'path'

export function createConfigFile(cwd: string, config: object) {
  fs.writeFileSync(path.join(cwd, 'komondor.config.json'), JSON.stringify(config))
}
