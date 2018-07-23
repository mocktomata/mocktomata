import { spec } from '../spec';
export function testLive(description, specNameOrHandler, inputHandler) {
    if (typeof specNameOrHandler === 'string') {
        inputHandler(`${description} (with ${specNameOrHandler}): live`, s => spec(specNameOrHandler, s));
    }
    else {
        specNameOrHandler(`${description}: live`, s => spec(description, s));
    }
}
//# sourceMappingURL=testLive.js.map