import { spec } from '../spec';
export function testSimulate(description, specNameOrHandler, inputHandler) {
    if (typeof specNameOrHandler === 'string') {
        inputHandler(`${description} (with ${specNameOrHandler}): simulate`, s => spec.simulate(specNameOrHandler, s));
    }
    else {
        specNameOrHandler(`${description}: simulate`, s => spec.simulate(description, s));
    }
}
//# sourceMappingURL=testSimulate.js.map