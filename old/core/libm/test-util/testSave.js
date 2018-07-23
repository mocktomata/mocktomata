import { spec } from '../spec';
export function testSave(description, specNameOrHandler, inputHandler) {
    if (typeof specNameOrHandler === 'string') {
        inputHandler(`${description} (with ${specNameOrHandler}): save`, s => spec.save(specNameOrHandler, s));
    }
    else {
        specNameOrHandler(`${description}: save`, s => spec.save(description, s));
    }
}
//# sourceMappingURL=testSave.js.map