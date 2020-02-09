import { start } from '@mocktomata/file-server';
import colors from 'ansi-colors';
import t from 'assert';
import { createCliTest, generateDisplayedMessage } from 'clibuilder';
import { serveCommand } from './serveCommand';

test('out of range port number emits error message', async () => {

  const { cli, argv, ui } = createCliTest(
    { commands: [serveCommand] },
    'serve', '--port', '90000')

  await cli.parse(argv)
  const message = generateDisplayedMessage(ui.display.errorLogs)
  t.strictEqual(message, `Port must be a valid port number`)
})

test('display started message', async () => {
  const { cli, argv, ui } = createCliTest({
    commands: [serveCommand],
    context: {
      _deps: {
        start: () => Promise.resolve({
          info: {
            protocol: 'http',
            port: 1234
          }
        }) as ReturnType<typeof start>
      }
    }
  }, 'serve')

  await cli.parse(argv)

  const message = generateDisplayedMessage(ui.display.infoLogs)

  expect(colors.unstyle(message)).toEqual(`
mocktomata server started.
-------------------------------------
      http://localhost:1234
-------------------------------------
`)
})
