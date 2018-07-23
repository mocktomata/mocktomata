import fs from 'fs';
import path from 'path';
export function readByHash(baseDir, id, hash, dupId = 0) {
    const filename = dupId ? hash + dupId : hash;
    const filePath = path.join(baseDir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    const [firstLine, specStr] = content.split('\n', 2);
    if (firstLine !== id) {
        return readByHash(baseDir, id, hash, dupId + 1);
    }
    return specStr;
}
//# sourceMappingURL=readByHash.js.map