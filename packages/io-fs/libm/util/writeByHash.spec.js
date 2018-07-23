import t from 'assert';
import fs from 'fs';
import { dirSync } from 'tmp';
import { writeByHash } from './writeByHash';
test('conflict id will save in different file', async () => {
    const tmp = dirSync();
    writeByHash(tmp.name, 'conflict1', '{ "actions":[], "expectation": "a" }', 'conflicted hash', 0);
    writeByHash(tmp.name, 'conflict2', '{ "actions":[], "expectation": "b" }', 'conflicted hash', 0);
    const dirs = fs.readdirSync(tmp.name);
    t.strictEqual(dirs.length, 2);
});
//# sourceMappingURL=writeByHash.spec.js.map