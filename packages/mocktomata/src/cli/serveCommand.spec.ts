import t from 'assert';
import { generateDisplayedMessage, setupCliCommandTest } from 'clibuilder';
import { dirSync } from 'tmp';
import { serveCommand } from './serveCommand';

test('out of range port number emits error message', async () => {
  const { cmd, args, argv, ui } = setupCliCommandTest(serveCommand, ['--port', '0'])
  const tmp = dirSync()
  cmd.context.cwd = tmp.name
  await cmd.run(args, argv)
  const message = generateDisplayedMessage(ui.display.errorLogs)
  t.strictEqual(message, `Port must be between 3000 and 65535`)
})

test('display started message', async () => {
  const { cmd, args, argv, ui } = setupCliCommandTest(serveCommand, [])
  const tmp = dirSync()
  cmd.context.cwd = tmp.name
  await cmd.run(args, argv)

  const message = generateDisplayedMessage(ui.display.infoLogs)
  t(/mocktomata server started/.test(message))
})
