import fs from 'fs'
import path from 'path'
import { MOCKTO_CONFIG_JS, MOCKTO_CONFIG_JSON, PACKAGE_JSON } from '../constants'
import { AmbiguousConfig, InvalidConfigFormat } from './errors'

export async function loadConfig(cwd: string) {
  const configs: { [k in string]: Record<string, any> } = {
    pjson: loadPjsonConfig(cwd),
    mjson: loadMjsonConfig(cwd),
    mjs: await loadMjsConfig(cwd)
  }

  const names = Object.keys(configs).filter(k => !!configs[k])
  if (names.length === 0) return {}

  if (names.length > 1) throw new AmbiguousConfig(names)

  const config = configs[names[0]]
  return config
}

function loadPjsonConfig(cwd: string) {
  const filepath = path.resolve(cwd, PACKAGE_JSON)
  if (fs.existsSync(filepath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pjson = require(path.relative(__dirname, filepath))
    if (pjson.mocktomata) return pjson.mocktomata
  }
}

function loadMjsonConfig(cwd: string) {
  const filepath = path.resolve(cwd, MOCKTO_CONFIG_JSON)
  if (fs.existsSync(filepath)) {
    try {
      return require(path.relative(__dirname, filepath))
    }
    catch (e) {
      // istanbul ignore next
      if (e.name === 'SyntaxError') {
        throw new InvalidConfigFormat(MOCKTO_CONFIG_JSON)
      }
    }
  }
}

function loadMjsConfig(cwd: string) {
  const filepath = path.join(cwd, MOCKTO_CONFIG_JS)
  if (fs.existsSync(filepath)) {
    try {
      return require(path.relative(__dirname, filepath))
    }
    catch (e) {
      // istanbul ignore next
      if (e.name === 'SyntaxError') {
        throw new InvalidConfigFormat(MOCKTO_CONFIG_JS)
      }
    }
  }
}
