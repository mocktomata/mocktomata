export function createTimeoutWarning(log, timeout) {
    const timeoutHandle = setTimeout(() => {
        log.warn(`done() was not called in ${timeout} ms. Did the test takes longer than expected or you forget to call done()?`);
    }, timeout);
    return { stop() { clearTimeout(timeoutHandle); } };
}
//# sourceMappingURL=createTimeoutWarning.js.map