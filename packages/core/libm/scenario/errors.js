import { KomondorError } from '../common';
export class ScenarioNotFound extends KomondorError {
    // istanbul ignore next
    constructor(id) {
        super(`Cannot find scenario '${id}'`);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=errors.js.map