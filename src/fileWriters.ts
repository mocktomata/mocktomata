import camelCase = require('camel-case')
import fs = require('fs')
import path = require('path')

import { SPECS_FOLDER } from './constants'
import { SpecRecord } from './interfaces'

export function writeSpec(id: string, description: string | undefined, specRecord: SpecRecord) {
  return new Promise<void>((a, r) => {
    try {
      if (!fs.existsSync(SPECS_FOLDER))
        createFolders(SPECS_FOLDER)
      fs.writeFileSync(path.resolve(SPECS_FOLDER, `${camelCase(id)}.json`), JSON.stringify({
        description,
        spec: specRecord
      }))
      a()
    }
    catch (err) {
      r(err)
    }
  })
}

// function write(id: string, calls: CallRecord[]) {
//   const location = path.resolve(`__boundspec__/${id}.json`)
//   save(location, calls.map(call => {
//     return call.then(
//       response => ({ arguments: call.arguments, response }),
//       error => ({ argumetns: call.arguments, error })
//     )
//   }))
// }
// function mergeRecords(records: CallRecord[], loadedRecords: CallRecord[]) {
//   const newRecords = records.filter(n => n.new)
//   return [...loadedRecords, ...newRecords]
// }

// function save(location: string, records) {
//   console.log(location)
//   if (!fs.existsSync(location))
//     createFolders(location)
//   const loadedRecords = fs.existsSync(location) ? JSON.parse(fs.readFileSync(location, 'utf8')) : []
//   records = mergeRecords(records, loadedRecords)

//   fs.writeFileSync(location, JSON.stringify(records))
//   console.log(fs.readFileSync(location, 'utf8'))
// }

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
