import path = require('path')

import { GivenRecord, SpecRecord } from './interfaces'
import { log } from './log'

export function getFileIO(baseDir: string) {
  const SPECS_FOLDER = `${baseDir}${path.sep}specs`
  const GIVENS_FOLDER = `${baseDir}${path.sep}givens`
  const SCENARIOS_FOLDER = `${baseDir}${path.sep}scenarios`
  const fs = require('fs')

  return {
    readSpec(id: string) {
      return new Promise<any>((a, r) => {
        const filePath = getJsonFilePath(SPECS_FOLDER, id)
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
    },
    writeSpec(id: string, record: SpecRecord) {
      return writeTo(SPECS_FOLDER, id, JSON.stringify(record))
    },
    writeGiven(id: string, record: GivenRecord) {
      return writeTo(GIVENS_FOLDER, id, JSON.stringify(record))
    },
    writeScenario(id: string, record) {
      return writeTo(SCENARIOS_FOLDER, id, JSON.stringify(record))
    }
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

  function writeTo(baseDir, id, json) {
    return new Promise<void>((a, r) => {
      try {
        const filePath = getJsonFilePath(baseDir, id)
        const folder = path.dirname(filePath)
        // istanbul ignore next
        if (!fs.existsSync(folder))
          createFolders(folder)
        fs.writeFileSync(filePath, json)
        a()
      }
      catch (err) {
        // istanbul ignore next
        r(err)
      }
    })
  }
}

function getJsonFilePath(baseDir: string, id: string) {
  const basename = path.basename(id)
  const dirname = path.dirname(id)
  return path.resolve(baseDir, dirname, `${basename}.json`)
}
