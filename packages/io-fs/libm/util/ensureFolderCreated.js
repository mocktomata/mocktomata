import fs from 'fs';
import mkdirp from 'mkdirp';
export function ensureFolderCreated(dir) {
    if (!fs.existsSync(dir))
        mkdirp.sync(dir);
}
//# sourceMappingURL=ensureFolderCreated.js.map