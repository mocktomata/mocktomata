import { ModuleError } from 'iso-error';
import { tersify } from 'tersify';
export class SpecError extends ModuleError {
    constructor(description, ...errors) {
        super('komondor-spec', description, ...errors);
    }
}
export class IDCannotBeEmpty extends SpecError {
    // istanbul ignore next
    constructor() {
        super(`The spec id cannot be an empty string. It should uniquely identify the spec.`);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class SpecNotFound extends SpecError {
    // istanbul ignore next
    constructor(specId, reason) {
        super(`Unable to find the spec record for '${specId}'${reason ? `due to: ${reason}` : ''}`);
        this.specId = specId;
        this.reason = reason;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class NotSpecable extends SpecError {
    // istanbul ignore next
    constructor(subject) {
        super(`The ${typeof subject === 'string' ? subject : `subject ${tersify(subject, { maxLength: 50 })}`} is not supported by any loaded plugins`);
        this.subject = subject;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class SimulationMismatch extends SpecError {
    // istanbul ignore next
    constructor(specId, expected, actual) {
        super(`Recorded data for '${specId}' doesn't match with simulation. Expecting ${tersify(expected, { maxLength: Infinity })} but received ${tersify(actual, { maxLength: Infinity })}`);
        this.specId = specId;
        this.expected = expected;
        this.actual = actual;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class MissingArtifact extends SpecError {
    // istanbul ignore next
    constructor(id) {
        super(`Missing artifact: ${id}`);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class PluginNotFound extends SpecError {
    // istanbul ignore next
    constructor(pluginName) {
        super(`Could not locate plugin '${pluginName}'`);
        this.pluginName = pluginName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class DuplicatePlugin extends SpecError {
    // istanbul ignore next
    constructor(pluginName) {
        super(`A plugin with the name '${pluginName}' has already been loaded.`);
        this.pluginName = pluginName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class NoActivate extends SpecError {
    constructor(moduleName) {
        super(`${moduleName} does not export an 'activate()' function`);
        this.moduleName = moduleName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class PluginNotConforming extends SpecError {
    // istanbul ignore next
    constructor(pluginName) {
        super(`${pluginName} is not a plugin.`);
        this.pluginName = pluginName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=errors.js.map