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
  return path.resolve(SPECS_FOLDER, `${camelCase(id)}.json`)
}

export function writeSpec(id: string, description: string | undefined, specRecord: SpecRecord) {
  return new Promise<void>((a, r) => {
    try {
      if (!fs.existsSync(SPECS_FOLDER))
        createFolders(SPECS_FOLDER)
      const { expectation, records } = specRecord
      fs.writeFileSync(getFilePath(id), JSON.stringify({
        description,
        expectation: tersify(expectation, { maxLength: Infinity, raw: true }),
        records
      }))
      a()
    }
    catch (err) {
      r(err)
    }
  })
}

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
