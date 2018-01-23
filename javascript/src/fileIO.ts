import fs = require('fs')
import path = require('path')

import { SPECS_FOLDER } from './constants'
import { SpecRecord } from './interfaces'
import { log } from './log'

export function readSpec(id: string) {
  return new Promise<any>((a, r) => {
    const filePath = getFilePath(id)
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const json = JSON.parse(content)
      a(json)
    }
    catch (err) {
      // istanbul ignore next
      r(err)
    }
  })
}
function getFilePath(id: string) {
  const basename = path.basename(id)
  const dirname = path.dirname(id)
  return path.resolve(SPECS_FOLDER, dirname, `${basename}.json`)
}

export function writeSpec(id: string, record: SpecRecord) {
  return new Promise<void>((a, r) => {
    try {
      const filePath = getFilePath(id)
      const folder = path.dirname(filePath)
      // istanbul ignore next
      if (!fs.existsSync(folder))
        createFolders(folder)
      fs.writeFileSync(filePath, JSON.stringify(record))
      a()
    }
    catch (err) {
      // istanbul ignore next
      r(err)
    }
  })
}

// istanbul ignore next
function createFolders(location: string) {
  const sep = path.sep;
  const initDir = path.isAbsolute(location) ? sep : '';
  location.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(parentDir, childDir);
    try {
      if (!fs.existsSync(curDir))
        fs.mkdirSync(curDir);
    }
    catch (err) {
      if (err.code !== 'EEXIST') {
        // istanbul ignore next
        throw err;
      }

      log.info(`Directory ${curDir} already exists!`);
    }

    return curDir;
  }, initDir);
}
