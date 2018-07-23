import { logLevel } from '@unional/logging';
import { tersify } from 'tersify';
import { log, KomondorError } from '../common';
export class IDCannotBeEmpty extends KomondorError {
    // istanbul ignore next
    constructor() {
        super(`The spec id cannot be an empty string. It should uniquely identify the spec.`);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class SpecNotFound extends KomondorError {
    // istanbul ignore next
    constructor(specId, reason) {
        super(`Unable to find the spec record for '${specId}'${reason ? `due to: ${reason}` : ''}`);
        this.specId = specId;
        this.reason = reason;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class NotSpecable extends KomondorError {
    // istanbul ignore next
    constructor(subject) {
        super(`The ${typeof subject === 'string' ? subject : `subject ${tersify(subject, { maxLength: 50 })}`} is not supported by any loaded plugins`);
        this.subject = subject;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class SimulationMismatch extends KomondorError {
    // istanbul ignore next
    constructor(specId, expected, actual) {
        super(`Recorded data for '${specId}' doesn't match with simulation. Expecting ${tersifyAction(expected)} but received ${tersifyAction(actual)}`);
        this.specId = specId;
        this.expected = expected;
        this.actual = actual;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
function tersifyAction(action) {
    if (!action)
        return 'none';
    if (log.level >= logLevel.debug) {
        return tersify(action, { maxLength: Infinity });
    }
    else {
        return `${['a', 'e', 'i', 'o', 'u'].some(x => action.type.startsWith(x)) ? 'an' : 'a'} ${action.type} action`;
    }
}
//# sourceMappingURL=errors.js.map