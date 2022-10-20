import { start } from '@mocktomata/service'
import colors from 'ansi-colors'
import { testCommand } from 'clibuilder'
import { serveCommand } from './serveCommand.js'

test('out of range port number emits error message', async () => {
  const { messages } = await testCommand(serveCommand, 'serve --port 90000')
  expect(messages).toContain(`Port must be a valid port number`)
})

test('display started message', async () => {
  const { messages } = await testCommand({
    ...serveCommand,
    context: {
      start: () => Promise.resolve({
        info: {
          protocol: 'http',
          port: 1234
        }
      }) as ReturnType<typeof start>
    }
  }, 'serve')

  expect(colors.unstyle(messages)).toContain(`
mocktomata server started.
-----------------------------
    http://localhost:1234
-----------------------------
`)
})
