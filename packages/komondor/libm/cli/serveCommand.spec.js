import t from 'assert';
import { generateDisplayedMessage, setupCliCommandTest } from 'clibuilder';
import { dirSync } from 'tmp';
import { createConfigFile } from '../test-util';
import { serveCommand } from './serveCommand';
describe('config/localPorts', () => {
    test('missing emits error message', async () => {
        const { cmd, args, argv, ui } = setupCliCommandTest(serveCommand, []);
        const tmp = dirSync();
        cmd.context.cwd = tmp.name;
        await cmd.run(args, argv);
        const message = generateDisplayedMessage(ui.display.errorLogs);
        t.strictEqual(message, `Local port can't be blank`);
    });
    test('out of range emits error message', async () => {
        const { cmd, args, argv, ui } = setupCliCommandTest(serveCommand, []);
        const tmp = dirSync();
        cmd.context.cwd = tmp.name;
        createConfigFile(tmp.name, { localPort: 0 });
        await cmd.run(args, argv);
        const message = generateDisplayedMessage(ui.display.errorLogs);
        t.strictEqual(message, `Local port must be between 3000 and 65535`);
    });
});
test('display started message', async () => {
    const { cmd, args, argv, ui } = setupCliCommandTest(serveCommand, []);
    const tmp = dirSync();
    cmd.context.cwd = tmp.name;
    createConfigFile(tmp.name, { localPort: 3123 });
    await cmd.run(args, argv);
    const message = generateDisplayedMessage(ui.display.infoLogs);
    t(/komondor server started/.test(message));
});
//# sourceMappingURL=serveCommand.spec.js.map