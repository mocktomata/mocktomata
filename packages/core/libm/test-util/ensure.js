import fs from 'fs';
import rimraf from 'rimraf';
export function ensureFileNotExists(filepath) {
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
    }
}
export function ensureDirNotExists(dirpath) {
    if (fs.existsSync(dirpath)) {
        rimraf.sync(dirpath);
    }
}
//# sourceMappingURL=ensure.js.map