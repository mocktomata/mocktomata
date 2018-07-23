import validatejs from 'validate.js';
export function validate({ ui }, value, constraints) {
    const failure = validatejs(value, constraints);
    if (failure === undefined)
        return true;
    Object.keys(failure).forEach(k => {
        const messages = failure[k];
        ui.error(...messages);
    });
    return false;
}
//# sourceMappingURL=validate.js.map