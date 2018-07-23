import { createTestIO } from './test-util';
import { context } from './context';
import { getLogger, addAppender, logLevel, removeAppender } from '@unional/logging';
import { MemoryAppender } from 'aurelia-logging-memory';
import { resetStore } from './store';
export function setupPluginTest(id = 'plugin-test') {
    const io = createTestIO();
    const log = getLogger(id, logLevel.debug);
    const appender = new MemoryAppender();
    addAppender(appender);
    context.set({
        io,
        log
    });
    resetStore();
    return {
        io,
        log,
        appender,
        reset() {
            context.clear();
            removeAppender(appender);
        }
    };
}
//# sourceMappingURL=setupPluginTest.js.map