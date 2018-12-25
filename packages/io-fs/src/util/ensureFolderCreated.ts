import fs from 'fs';
import mkdirp from 'mkdirp';

export function ensureFolderCreated(dir: string) {
  if (!fs.existsSync(dir)) mkdirp.sync(dir)
}
