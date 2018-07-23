import { setupCliTest, generateDisplayedMessage } from 'clibuilder';
import { cli } from './cli';
test('start with default port', async () => {
    const { argv, ui } = setupCliTest(cli, ['start']);
    await cli.parse(argv);
    const msg = generateDisplayedMessage(ui.display.infoLogs);
    expect(msg).toEqual(`
--------------------------------------------
--- komondor server started at port 3698 ---
--------------------------------------------
`);
});
test('start at specific port', async () => {
    const { argv, ui } = setupCliTest(cli, ['start', '--port', '4567']);
    await cli.parse(argv);
    const msg = generateDisplayedMessage(ui.display.infoLogs);
    expect(msg).toEqual(`
--------------------------------------------
--- komondor server started at port 4567 ---
--------------------------------------------
`);
});
//# sourceMappingURL=cli.spec.js.map