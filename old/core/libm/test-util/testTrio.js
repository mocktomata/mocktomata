import { testLive } from './testLive';
import { testSave } from './testSave';
import { testSimulate } from './testSimulate';
export function testTrio(description, specNameOrHandler, inputHandler) {
    testLive(description, specNameOrHandler, inputHandler);
    testSave(description, specNameOrHandler, inputHandler);
    testSimulate(description, specNameOrHandler, inputHandler);
}
//# sourceMappingURL=testTrio.js.map