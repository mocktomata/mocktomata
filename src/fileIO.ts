import camelCase = require('camel-case')
import fs = require('fs')
import path = require('path')
import { tersify } from 'tersify'

import { SPECS_FOLDER } from './constants'
import { SpecRecord } from './interfaces'

export function readSpec(id: string) {
  return new Promise<SpecRecord>((a, r) => {
    const filePath = getFilePath(id)
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const json = JSON.parse(content)
      // todo: convert json.expectation from string back to Expectation.
      a(json)
    }
    catch (err) {
      r(err)
    }
  })
}
function getFilePath(id: string) {
  const basename = path.basename(id)
  const dirname = path.dirname(id)
  return path.resolve(SPECS_FOLDER, dirname, `${camelCase(basename)}.json`)
}

export function writeSpec(id: string, description: string | undefined, specRecord: SpecRecord) {
  return new Promise<void>((a, r) => {
    try {
      const filePath = getFilePath(id)
      const folder = path.dirname(filePath)
      // istanbul ignore next
      if (!fs.existsSync(folder))
        createFolders(folder)
      const { expectation, records } = specRecord
      records.forEach(r => {
        // error.message is not enumerable.
        // JSON.stringify() will get `{}`
        if (r.error) {
          r.error = { message: r.error.message, ...r.error }
        }
      })
      fs.writeFileSync(filePath, JSON.stringify({
        description,
        expectation: tersify(expectation, { maxLength: Infinity, raw: true }),
        records
      }))
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
        throw err;
      }

      console.log(`Directory ${curDir} already exists!`);
    }

    return curDir;
  }, initDir);
}
