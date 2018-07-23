import { BaseError } from 'make-error';
import { tersify } from 'tersify';
export class SourceNotFound extends BaseError {
    // istanbul ignore next
    constructor(action) {
        super(`Unable to locate source action for ${tersify(action, { maxLength: Infinity })}`);
        this.action = action;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=errors.js.map