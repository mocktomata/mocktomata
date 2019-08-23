import fs from 'fs';
import path from 'path';
import { AmbiguousConfig, InvalidConfigFormat } from './errors';

export function loadConfig(cwd: string) {
  const configs: { [k in string]: Record<string, any> } = {
    pjson: loadPjsonConfig(cwd),
    kjson: loadKjsonConfig(cwd),
    kjs: loadKjsConfig(cwd)
  }

  const names = Object.keys(configs).filter(k => !!configs[k])
  if (names.length === 0) return {}

  if (names.length > 1) throw new AmbiguousConfig(names)

  const config = configs[names[0]]

  return config
}

function loadPjsonConfig(cwd: string) {
  const pjsonPath = path.resolve(cwd, 'package.json')
  if (fs.existsSync(pjsonPath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pjson = require(pjsonPath)
    if (pjson.komondor) return pjson.komondor
  }
}

function loadKjsonConfig(cwd: string) {
  const filepath = path.resolve(cwd, '.komondor.json')
  if (fs.existsSync(filepath)) {
    try {
      return require(filepath)
    }
    catch (e) {
      if (e.name === 'SyntaxError') {
        throw new InvalidConfigFormat('.komondor.json')
      }
    }
  }
}

function loadKjsConfig(cwd: string) {
  const filepath = path.resolve(cwd, '.komondor.js')
  if (fs.existsSync(filepath)) {
    try {
      return require(filepath)
    }
    catch (e) {
      if (e.name === 'SyntaxError') {
        throw new InvalidConfigFormat('.komondor.js')
      }
    }
  }
}
