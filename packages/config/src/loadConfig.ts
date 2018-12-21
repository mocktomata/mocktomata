import path from 'path';
import { setConfig } from './setConfig';

export function loadConfig(cwd: string): void {
  const pjson = require(path.resolve(cwd, 'package.json'))
  if (pjson.komondor) {
    setConfig(pjson.komondor)
  }
}
