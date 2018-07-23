import { BaseError } from 'make-error';
export class ScenarioNotFound extends BaseError {
    // istanbul ignore next
    constructor(id) {
        super(`Cannot find scenario '${id}'`);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=errors.js.map