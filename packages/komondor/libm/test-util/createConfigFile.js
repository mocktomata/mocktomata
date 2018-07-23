import fs from 'fs';
import path from 'path';
export function createConfigFile(cwd, config) {
    fs.writeFileSync(path.join(cwd, 'komondor.config.json'), JSON.stringify(config));
}
//# sourceMappingURL=createConfigFile.js.map