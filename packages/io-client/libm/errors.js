import { BaseError } from 'make-error';
export class ServerNotAvailable extends BaseError {
    constructor(url) {
        super(`Unable to connect to server at ${url}`);
        this.url = url;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
// istanbul ignore next
export class ServerNotAvailableAtPortRange extends BaseError {
    constructor(url, start, end) {
        super(`Unable to find komondor server at ${url} between port ${start} and ${end}`);
        this.url = url;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=errors.js.map