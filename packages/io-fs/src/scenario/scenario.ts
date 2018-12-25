import { SCENARIOS_FOLDER, SPECS_FOLDER } from '../constants';
import { ensureFolderCreated } from '../util/ensureFolderCreated';
import { ScenarioNotFound } from '../errors';
import { getHash } from '../util/getHash';
import { readByHash } from '../util/readByHash';
import { writeTo } from '../util/writeTo';

export function readScenario(id: string) {
  const hash = getHash(id)
  return new Promise<any>((a, r) => {
    try {
      a(readByHash(readScenario.dir, id, hash))
    }
    catch (err) {
      // istanbul ignore next
      if (err.code === 'ENOENT')
        r(new ScenarioNotFound(id))
      else {
        r(err)
      }
    }
  })
}

readScenario.dir = SPECS_FOLDER

export function writeScenario(id: string, scenarioStr: string) {
  ensureFolderCreated(writeScenario.dir)
  return writeTo(writeScenario.dir, id, scenarioStr)
}

writeScenario.dir = SCENARIOS_FOLDER
