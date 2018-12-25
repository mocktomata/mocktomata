import path from 'path'
import { KOMONDOR_FOLDER } from '../constants';

export function getSpecFolder(cwd: string) {
  return path.resolve(cwd, KOMONDOR_FOLDER, 'specs')
}
