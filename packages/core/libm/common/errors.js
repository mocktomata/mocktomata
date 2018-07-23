import { ModuleError } from 'iso-error';
export class KomondorError extends ModuleError {
    constructor(description, ...errors) {
        super('komondor', description, ...errors);
    }
}
//# sourceMappingURL=errors.js.map